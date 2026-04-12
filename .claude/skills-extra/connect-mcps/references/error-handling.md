# connect-mcps: Error Handling, Edge Cases, and Troubleshooting

## Common Issues and Solutions

### 1. MCP Documentation Not Found

```
Me: I couldn't find setup documentation for [tool] MCP.

Do you have a link to the documentation or know the setup requirements?

User: [provides link or details]

Me: [proceeds with setup using provided info]
```

### 2. Invalid Credentials

```
Me: Connection test failed. The API key appears to be invalid.

Please double-check:
- API key is copied completely (no extra spaces)
- API key has required permissions
- API key hasn't expired

Want to try again? Enter your API key:
```

### 3. MCP Already Connected

```
User: /connect-mcps connect to amplitude

Me: Amplitude is already connected!

Current configuration:
- Category: Analytics
- Tools: query_insights, get_funnels, cohort_analysis
- Used in: 7 skills

Want to:
- Test connection (verify it still works)
- Reconfigure (update credentials)
- View integration details
```

### 4. Skill File Read-Only

```
Me: Warning: Couldn't update feature-metrics skill (file locked)

I'll continue with other skills and log this issue.

14 out of 15 skills updated successfully.

Check: outputs/mcp-integration-logs/[timestamp]-errors.md
```

### 5. Ambiguous Category

```
Me: I found [tool] MCP but I'm unsure which category it fits.

The tool appears to handle:
- Feature flagging
- A/B testing
- Analytics

Which PM OS skills should integrate with this MCP?
A) Analytics skills (metrics, retention, experiments)
B) Product skills (PRD, decisions)
C) Both A and B

User: C

Me: [maps to both skill groups]
```

---

## Troubleshooting Guide

### "I couldn't find documentation for [tool] MCP"

The tool may not have an official MCP server yet. Check:
- The tool's official docs for MCP support
- GitHub for community MCP implementations
- The Anthropic MCP directory (https://modelcontextprotocol.io)

If no MCP exists, use the tool manually and store outputs in `work/context/`.

### "Connection test failed"

1. Verify credentials are correct (no typos, no extra spaces)
2. Check API key hasn't expired
3. Confirm API key has required permissions/scopes
4. Test the API key in the tool's web interface first
5. Check for network/firewall issues blocking MCP server

### "Skills weren't updated"

1. Check the integration log in `outputs/mcp-integration-logs/`
2. Look for error messages indicating which skills failed
3. Verify skill files aren't read-only or locked
4. Re-run `/connect-mcps connect to [tool]` to retry updates

### "Queries aren't routing to my MCP"

1. Check `CLAUDE.md` → "MCP Integrations" → Verify MCP is listed
2. Verify routing logic includes your MCP category
3. Try being more explicit: "Use Amplitude to show me metrics on X"
4. Check if MCP connection is still active (test with simple query)

### "I want to disconnect an MCP"

Currently, to disconnect:
1. Remove the MCP from your system (uninstall server/remove credentials)
2. Edit `CLAUDE.md` to remove the MCP from the registry table
3. Optionally, remove MCP sections from skill files

(Future enhancement: `/mcp disconnect [tool]` command)

---

## Common Mistakes to Avoid

- Don't paste credentials in chat without being prompted -- wait for me to explicitly ask.
- Use `/connect-mcps connect to amplitude`, not `/connect-mcps amplitude`.
- For local MCPs: install the MCP server locally first (via NPM, Docker, etc.), then run connect.
- Don't start querying until you see the success message.
- Don't manually edit CLAUDE.md -- let me update the registry automatically.
- Don't connect duplicate MCPs unless you're reconfiguring.
- Read error messages -- they usually tell you exactly what's wrong.
- Some MCPs require specific permissions or scopes on the API key -- check the tool's documentation.

---

## Getting Help

**Resources:**
- MCP Documentation: https://modelcontextprotocol.io
- Anthropic Forums: https://discuss.anthropic.com
- GitHub Issues: https://github.com/modelcontextprotocol/servers
- Community Discord: MCP Community server

**For PM-specific help:**
- Check `outputs/mcp-integration-logs/` for detailed error messages
- Ask in chat: "Why did my Amplitude connection fail?"
- Reference CLAUDE.md → MCP Integrations section for routing logic
