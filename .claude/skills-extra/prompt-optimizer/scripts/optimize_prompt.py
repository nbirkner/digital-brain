#!/usr/bin/env python3
"""
Karpathy Self-Improving Loop for Prompts
Execute → Score → Analyze → Mutate → git commit/reset
Uses the `claude` CLI — no API key needed, runs on your Claude subscription.
"""

import argparse
import json
import re
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

DELAY = 3  # seconds between claude calls — override with --delay


def run_claude(message, model=None):
    """Run a message through the claude CLI and return the output text."""
    time.sleep(DELAY)
    cmd = ["claude", "-p", message]
    if model:
        cmd += ["--model", model]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"claude CLI error: {result.stderr.strip()}")
    return result.stdout.strip()


def run_prompt(system_prompt, user_input, model=None):
    """Execute a system prompt against a test input."""
    message = f"<system>\n{system_prompt}\n</system>\n\n{user_input}"
    return run_claude(message, model)


def score_output(output, checks, model=None):
    """Grade an output against binary yes/no checks. Returns dict of check -> bool."""
    checks_formatted = "\n".join(f"{i+1}. {check}" for i, check in enumerate(checks))
    message = f"""You are a strict quality evaluator. For each criterion, answer ONLY "yes" or "no" based solely on the output below.

OUTPUT:
{output}

CRITERIA:
{checks_formatted}

Respond with a JSON object mapping criterion number to "yes" or "no". Example: {{"1": "yes", "2": "no", "3": "yes"}}
Only output the JSON object, nothing else."""

    text = run_claude(message, model)
    json_match = re.search(r"\{[^}]+\}", text, re.DOTALL)
    if json_match:
        try:
            raw = json.loads(json_match.group())
            return {checks[int(k) - 1]: str(v).lower() == "yes" for k, v in raw.items()}
        except (json.JSONDecodeError, KeyError, IndexError):
            pass
    print(f"  Warning: could not parse score response: {text[:100]}")
    return {check: False for check in checks}


def mutate_prompt(current_prompt, weakest_check, all_checks, recent_history, model=None):
    """Make ONE targeted change to improve the weakest criterion."""
    history_str = (
        "\n".join(
            f"Round {h['round']}: {h['score_before']:.1%}→{h['score_after']:.1%} "
            f"({'kept' if h['kept'] else 'reverted'}) — {h['change']}"
            for h in recent_history[-6:]
        )
        if recent_history
        else "No history yet."
    )

    message = f"""You are an expert prompt engineer optimizing a system prompt for reliability.

CURRENT PROMPT:
---
{current_prompt}
---

ALL QUALITY CRITERIA (binary yes/no):
{chr(10).join(f"- {c}" for c in all_checks)}

WEAKEST CRITERION (failing most often):
{weakest_check}

RECENT HISTORY (what was tried):
{history_str}

Make exactly ONE targeted change to the prompt that directly addresses the weakest criterion without breaking the others. Avoid repeating changes that were already tried and reverted. Be specific and surgical. Do not rewrite everything.

Respond in this exact format:
CHANGE: [one sentence: what you changed and why it should help]
IMPROVED PROMPT:
[the full improved prompt text, nothing else after it]"""

    text = run_claude(message, model)
    change_match = re.search(r"CHANGE:\s*(.+?)(?:\n|$)", text)
    prompt_match = re.search(r"IMPROVED PROMPT:\s*\n(.*)", text, re.DOTALL)
    change = change_match.group(1).strip() if change_match else "Targeted improvement"
    new_prompt = prompt_match.group(1).strip() if prompt_match else current_prompt
    return new_prompt, change


def git_commit(prompt_file, round_num, score, change):
    subprocess.run(["git", "add", str(prompt_file)], check=True)
    result = subprocess.run(["git", "diff", "--cached", "--quiet"])
    if result.returncode == 0:
        return  # nothing staged — mutation produced identical content, skip commit
    subprocess.run(["git", "commit", "-m", f"prompt-optimizer: round {round_num}, score {score:.1%} — {change}"], check=True)


def git_reset_file(prompt_file):
    subprocess.run(["git", "checkout", "HEAD", "--", str(prompt_file)], check=True)


def run_eval(prompt_text, inputs, checks, executions_per_input, model=None):
    """Run full evaluation. Returns (overall_score, criterion_rates, raw_outputs)."""
    all_scores = {check: [] for check in checks}
    raw_outputs = []

    for test_input in inputs:
        for _ in range(executions_per_input):
            try:
                output = run_prompt(prompt_text, test_input, model)
                scores = score_output(output, checks, model)
                raw_outputs.append({"input": test_input, "output": output, "scores": scores})
                for check, passed in scores.items():
                    all_scores[check].append(passed)
            except Exception as e:
                print(f"  Warning: execution error: {e}")

    if not any(all_scores.values()):
        return 0.0, {check: 0.0 for check in checks}, []

    criterion_rates = {
        check: (sum(passes) / len(passes) if passes else 0.0)
        for check, passes in all_scores.items()
    }
    overall = sum(criterion_rates.values()) / len(criterion_rates)
    return overall, criterion_rates, raw_outputs


def dry_run(prompt_file, inputs, checks, model):
    """Run 1 execution per input, print outputs + scores, then exit."""
    prompt_text = prompt_file.read_text()
    print(f"\n{'='*60}")
    print(f"DRY RUN — {len(inputs)} sample outputs")
    print(f"{'='*60}\n")

    all_pass = {check: [] for check in checks}

    for i, test_input in enumerate(inputs, 1):
        print(f"--- Input {i} ---")
        print(f"{test_input[:120]}{'...' if len(test_input) > 120 else ''}\n")
        print("Running prompt...", end=" ", flush=True)
        output = run_prompt(prompt_text, test_input, model)
        scores = score_output(output, checks, model)
        print("done\n")

        print(f"OUTPUT:\n{output}\n")
        print("SCORES:")
        for check, passed in scores.items():
            icon = "✓" if passed else "✗"
            print(f"  {icon} {check}")
            all_pass[check].append(passed)
        print()

    # Summary
    print(f"{'='*60}")
    print("OVERALL PASS RATES:")
    total = 0.0
    for check, results in all_pass.items():
        rate = sum(results) / len(results)
        total += rate
        bar = "█" * int(rate * 10) + "░" * (10 - int(rate * 10))
        print(f"  {bar} {rate:.0%}  {check}")
    overall = total / len(checks)
    print(f"\n  Overall: {overall:.0%} (target: 95%)")
    print(f"{'='*60}")
    print("\nDo these outputs look right? If yes, run without --dry-run to start the full loop.")


def main():
    parser = argparse.ArgumentParser(
        description="Karpathy Self-Improving Loop: optimize a prompt to 95%+ reliability."
    )
    parser.add_argument("--prompt", required=True, help="Path to the prompt/skill file to optimize")
    parser.add_argument("--inputs", nargs="+", required=True, help="2-3 realistic test inputs (quote each)")
    parser.add_argument("--checks", nargs="+", required=True, help="3-6 binary quality checks")
    parser.add_argument("--target", type=float, default=95.0, help="Target pass rate %% (default: 95)")
    parser.add_argument("--rounds", type=int, default=50, help="Max optimization rounds (default: 50)")
    parser.add_argument("--executions", type=int, default=5, help="Executions per input per round (default: 5)")
    parser.add_argument("--model", default=None, help="Model to use (default: claude CLI default)")
    parser.add_argument("--output-dir", default=None, help="Directory for outputs (default: same dir as prompt)")
    parser.add_argument("--delay", type=float, default=3.0, help="Seconds between claude calls (default: 3, use 15 for overnight)")
    parser.add_argument("--dry-run", action="store_true", help="Run 1x per input, show outputs + scores, then exit without optimizing")
    args = parser.parse_args()

    global DELAY
    DELAY = args.delay

    if subprocess.run(["which", "claude"], capture_output=True).returncode != 0:
        print("Error: 'claude' CLI not found.")
        sys.exit(1)

    prompt_file = Path(args.prompt).resolve()
    if not prompt_file.exists():
        print(f"Error: prompt file not found: {prompt_file}")
        sys.exit(1)

    # Dry run mode — show sample outputs and exit
    if args.dry_run:
        dry_run(prompt_file, args.inputs, args.checks, args.model)
        return

    output_dir = Path(args.output_dir).resolve() if args.output_dir else prompt_file.parent
    output_dir.mkdir(parents=True, exist_ok=True)
    results_log = output_dir / "results.log"
    changelog_path = output_dir / "changelog.md"

    # Estimate runtime
    calls_per_round = (args.executions * len(args.inputs) * 2) + (2 * len(args.inputs)) + 2
    est_minutes = (calls_per_round * args.delay * args.rounds) / 60
    print(f"\nKarpathy Self-Improving Loop")
    print(f"Target file : {prompt_file}")
    print(f"Target      : {args.target}% | Max rounds: {args.rounds} | Delay: {args.delay}s")
    print(f"Est. runtime: ~{est_minutes:.0f} min ({est_minutes/60:.1f} hrs)")
    print(f"Checks ({len(args.checks)}):")
    for i, check in enumerate(args.checks, 1):
        print(f"  {i}. {check}")
    print(f"\nProgress log: tail -f {output_dir}/run.out")
    print()

    with open(changelog_path, "w") as f:
        f.write(f"# Prompt Optimization Changelog\n\n")
        f.write(f"**File:** `{prompt_file}`  \n")
        f.write(f"**Started:** {datetime.now().strftime('%Y-%m-%d %H:%M')}  \n")
        f.write(f"**Target:** {args.target}%  \n\n## Quality Checks\n")
        for i, check in enumerate(args.checks, 1):
            f.write(f"{i}. {check}\n")
        f.write(f"\n---\n\n")

    history = []
    baseline_score = None

    for round_num in range(1, args.rounds + 1):
        current_prompt = prompt_file.read_text()
        print(f"[{datetime.now().strftime('%H:%M')}] Round {round_num}/{args.rounds} — evaluating...", end=" ", flush=True)

        score, criterion_rates, _ = run_eval(current_prompt, args.inputs, args.checks, args.executions, args.model)

        if baseline_score is None:
            baseline_score = score
            print(f"\nBaseline: {score:.1%}")
            with open(changelog_path, "a") as f:
                f.write(f"## Baseline: {score:.1%}\n\n")

        weakest_check = min(criterion_rates, key=criterion_rates.get)
        print(f"Score: {score:.1%} | Weakest: \"{weakest_check}\" ({criterion_rates[weakest_check]:.1%})")

        with open(results_log, "a") as f:
            f.write(json.dumps({
                "round": round_num,
                "timestamp": datetime.now().isoformat(),
                "score": round(score, 4),
                "criterion_rates": {k: round(v, 4) for k, v in criterion_rates.items()},
                "weakest": weakest_check,
            }) + "\n")

        if score >= args.target / 100:
            print(f"\nTarget {args.target}% reached at round {round_num}!")
            with open(changelog_path, "a") as f:
                f.write(f"## DONE — Round {round_num}: {score:.1%}\n")
            break

        print(f"  Mutating...", end=" ", flush=True)
        new_prompt, change = mutate_prompt(current_prompt, weakest_check, args.checks, history, args.model)
        print("done")

        prompt_file.write_text(new_prompt)
        new_score, _, _ = run_eval(new_prompt, args.inputs, args.checks, 2, args.model)
        kept = new_score > score

        if kept:
            git_commit(prompt_file, round_num, new_score, change)
        else:
            git_reset_file(prompt_file)

        print(f"  {'KEPT    ' if kept else 'REVERTED'}: {score:.1%} → {new_score:.1%} — {change}")

        history.append({"round": round_num, "score_before": score, "score_after": new_score, "change": change, "kept": kept})

        with open(changelog_path, "a") as f:
            icon = "✓" if kept else "✗"
            f.write(f"## Round {round_num}: {score:.1%} → {new_score:.1%} {icon}\n")
            f.write(f"**{'Kept' if kept else 'Reverted'}:** {change}\n\n")

    # Final
    final_prompt = prompt_file.read_text()
    final_score, _, _ = run_eval(final_prompt, args.inputs, args.checks, args.executions, args.model)
    improved_path = prompt_file.parent / f"{prompt_file.stem}-optimized{prompt_file.suffix}"
    improved_path.write_text(final_prompt)

    delta = final_score - (baseline_score or 0)
    kept_count = sum(1 for h in history if h["kept"])

    print(f"\n{'='*50}")
    print(f"Done  |  {baseline_score:.1%} → {final_score:.1%}  (+{delta:.1%})  |  {kept_count}/{len(history)} kept")
    print(f"Improved prompt : {improved_path}")
    print(f"Changelog       : {changelog_path}")

    with open(changelog_path, "a") as f:
        f.write(f"\n---\n\n## Summary\n\n- Baseline: {baseline_score:.1%}\n- Final: {final_score:.1%}\n- Delta: +{delta:.1%}\n- Rounds: {len(history)}\n- Kept: {kept_count}/{len(history)}\n")

    # Write a clean summary.md — easy morning read
    kept_changes = [h for h in history if h["kept"]]
    summary_path = output_dir / "summary.md"
    with open(summary_path, "w") as f:
        f.write(f"# Autoresearch Summary\n\n")
        f.write(f"**File:** `{prompt_file}`  \n")
        f.write(f"**Finished:** {datetime.now().strftime('%Y-%m-%d %H:%M')}  \n\n")
        f.write(f"## Score\n\n")
        f.write(f"| | |\n|---|---|\n")
        f.write(f"| Baseline | {baseline_score:.1%} |\n")
        f.write(f"| Final | {final_score:.1%} |\n")
        f.write(f"| Delta | +{delta:.1%} |\n")
        f.write(f"| Rounds run | {len(history)} |\n")
        f.write(f"| Changes kept | {kept_count}/{len(history)} |\n\n")
        f.write(f"## Quality Checks\n\n")
        for check in args.checks:
            f.write(f"- {check}\n")
        if kept_changes:
            f.write(f"\n## Changes That Improved the Prompt\n\n")
            for h in kept_changes:
                f.write(f"- **Round {h['round']}** ({h['score_before']:.1%} → {h['score_after']:.1%}): {h['change']}\n")
        else:
            f.write(f"\n## Changes\n\nNo changes improved the score — the original prompt was already near-optimal.\n")
        f.write(f"\n## Files\n\n")
        f.write(f"- **Optimized prompt:** `{improved_path}`\n")
        f.write(f"- **Full changelog:** `{changelog_path}`\n")
        f.write(f"- **Round-by-round log:** `{output_dir}/results.log`\n")
    print(f"Summary         : {summary_path}")


if __name__ == "__main__":
    main()
