import PageHeader from "@/components/layout/PageHeader"
import PagePathStatic from "@/components/layout/PagePathStatic"

export default function MiloInstructionsPage() {
  return (
    <div>
      <PagePathStatic path="life/luci/milo-instructions" />

      <PageHeader
        icon="🏠"
        title="Milo Animals Instructions"
        description="Official adoption instructions from Milo Foundation, Richmond CA."
      />

      <div className="space-y-6 text-sm text-notion-muted leading-relaxed">
        {/* Notice */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-700">
          <p>
            <strong className="text-amber-700">NOTE:</strong> Due to an overwhelming number of emails and phone calls
            coming to Milo, our limited staff will not be able to respond to all inquiries as fast as we would like to.
            Please read the instructions below THOROUGHLY.
          </p>
        </div>

        {/* Hours */}
        <div className="bg-notion-surface border border-notion-border rounded-xl p-4">
          <h2 className="font-semibold text-notion-text mb-2">Hours</h2>
          <p>
            Milo is closed as normal on Tuesdays, but limited staff will be available to offer assistance every other
            day from <strong className="text-notion-text">11am to 5pm</strong>.
          </p>
        </div>

        {/* Liability */}
        <div className="bg-notion-surface border border-notion-border rounded-xl p-4">
          <h2 className="font-semibold text-notion-text mb-2">Liability Notice</h2>
          <p>
            By filling out an application the individual acknowledges the potential risks involved and voluntarily
            assumes the responsibility and liability of any potential incident and agree to not pursue any legal charges.
          </p>
        </div>

        {/* Visit procedure */}
        <div className="bg-notion-surface border border-notion-border rounded-xl p-5">
          <h2 className="font-semibold text-notion-text mb-3">Visit Procedure</h2>
          <p className="mb-4">
            Visitors must read their full acceptance email before adoption. Before arriving to Milo please bring all
            household members and any dogs in the household.
          </p>
          <ol className="space-y-3 list-none pl-0">
            {[
              "Check in with adoption counselors at the front desk.",
              "Staff or volunteer will go over your application and assist you in finding the right companion.",
              "Further instructions will be given to you by our staff.",
              "Scheduled meetings with a Milo dog will occur outside of our building with staff assistance. Meetings for cats will occur inside our cat rooms with staff assistance.",
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-notion-hover border border-notion-border text-notion-text text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 italic text-notion-muted/70">
            ** If you wish to proceed with an adoption, our staff will help you complete the process.
          </p>
        </div>

        {/* Sanctuary animals */}
        <div className="bg-notion-surface border border-notion-border rounded-xl p-5">
          <h2 className="font-semibold text-notion-text mb-3">If the Animal is at our Sanctuary</h2>
          <p>
            Please allow our Sanctuary staff a few days to respond, as they have many animals and almost 300 acres of
            land to maintain daily. Note that the travel time to or from Willits is more than three hours, so animals
            are not often transported between there and Richmond. We prefer that interested parties meet an animal at
            the animal&apos;s current location. Transport of a specific animal will be considered only when strong
            interest is assured.
          </p>
        </div>

        {/* Foster animals */}
        <div className="bg-notion-surface border border-notion-border rounded-xl p-5">
          <h2 className="font-semibold text-notion-text mb-3">If the Animal is in Foster Care</h2>
          <ol className="space-y-3 list-none pl-0">
            {[
              "Our staff will review your Questionnaire.",
              "If it looks like a good match for the animal, your contact information will be sent to the foster person.",
              "The foster person will contact you at a later time to discuss where and when the meet-and-greet will occur. Please do not attempt to make an appointment with Milo, as the foster will make the arrangement at their discretion.",
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-notion-hover border border-notion-border text-notion-text text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Closing */}
        <div className="border-t border-notion-border pt-4 text-notion-muted/60 italic text-xs text-center">
          For everyone&apos;s health and safety, you must follow the instructions as shown above to receive assistance.
          Thank you for your understanding and cooperation, and for your love of the animals whose needs continue every
          day. — <strong>Milo Staff</strong>
        </div>
      </div>
    </div>
  )
}
