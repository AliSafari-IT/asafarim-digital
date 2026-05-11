import type { Dictionaries } from "@asafarim/shared-i18n";

/**
 * EduMatch-specific translation overrides. Keys here shadow the base dictionary
 * from `@asafarim/shared-i18n`. Add app-only keys under the `edumatch.*` prefix.
 */
export const edumatchDictionaries: Dictionaries = {
  en: {
    // Navigation
    "edumatch.nav.home": "Home",
    "edumatch.nav.student": "Student",
    "edumatch.nav.tutor": "Tutor",
    "edumatch.nav.signIn": "Sign In",
    "edumatch.nav.signOut": "Sign Out",

    // Hero
    "edumatch.hero.badge": "Now Live — Get AI Help Instantly",
    "edumatch.hero.title": "Get Unstuck with AI + Expert Tutors",
    "edumatch.hero.subtitle":
      "Snap a photo, get an AI explanation in seconds. Need deeper help? Get matched with verified tutors and book sessions instantly.",
    "edumatch.hero.cta.student": "Get Started as Student",
    "edumatch.hero.cta.tutor": "Become a Tutor",
    "edumatch.hero.cta.ask": "Ask a Question",
    "edumatch.hero.cta.dashboard": "Go to Dashboard",

    // How it works
    "edumatch.how.title": "How EduMatch Works",
    "edumatch.how.step1.title": "Ask Your Question",
    "edumatch.how.step1.desc":
      "Upload a photo, voice note, or type your question. Our AI understands context and complexity.",
    "edumatch.how.step2.title": "Get AI Help",
    "edumatch.how.step2.desc":
      "Receive a detailed explanation in seconds. Follow-up questions are free.",
    "edumatch.how.step3.title": "Match with Tutors",
    "edumatch.how.step3.desc":
      "Need more help? Request quotes from verified local tutors. Compare and book instantly.",

    // For Students
    "edumatch.students.section": "For Students",
    "edumatch.students.title": "Homework Help, Reimagined",
    "edumatch.students.feature1.title": "AI Explanations",
    "edumatch.students.feature1.desc":
      "Get step-by-step explanations tailored to your grade level and subject.",
    "edumatch.students.feature2.title": "Any Format",
    "edumatch.students.feature2.desc":
      "Upload photos, voice notes, or text. We handle images, audio, and documents.",
    "edumatch.students.feature3.title": "Expert Tutors",
    "edumatch.students.feature3.desc":
      "Verified tutors matched to your location and subject needs.",
    "edumatch.students.feature4.title": "Safe Payments",
    "edumatch.students.feature4.desc":
      "Secure checkout with Stripe. Pay only when you book a session.",

    // For Tutors
    "edumatch.tutors.section": "For Tutors",
    "edumatch.tutors.title": "Earn Teaching What You Love",
    "edumatch.tutors.feature1.title": "Set Your Rate",
    "edumatch.tutors.feature1.desc":
      "You control your hourly rate. We add a small platform fee.",
    "edumatch.tutors.feature2.title": "Flexible Schedule",
    "edumatch.tutors.feature2.desc":
      "Choose when you're available. Students book slots that work for you.",
    "edumatch.tutors.feature3.title": "Fast Payouts",
    "edumatch.tutors.feature3.desc":
      "Get paid to your bank account within 48 hours of session completion.",
    "edumatch.tutors.cta": "Start Tutoring Today",

    // Stats
    "edumatch.stats.questions": "Questions Answered",
    "edumatch.stats.tutors": "Verified Tutors",
    "edumatch.stats.satisfaction": "Student Satisfaction",

    // Final CTA
    "edumatch.cta.title": "Ready to Get Started?",
    "edumatch.cta.subtitle":
      "Join thousands of students getting help and tutors earning income.",
    "edumatch.cta.ask": "Ask a Question",
    "edumatch.cta.tutor": "Become a Tutor",

    // Footer
    "edumatch.footer.tagline": "AI-first homework help and tutor marketplace.",
    "edumatch.footer.students": "Students",
    "edumatch.footer.tutors": "Tutors",
    "edumatch.footer.legal": "Legal",
    "edumatch.footer.privacy": "Privacy",
    "edumatch.footer.terms": "Terms",
    "edumatch.footer.rights": "All rights reserved.",

    // Dashboard
    "edumatch.dashboard.welcome": "Welcome back",
    "edumatch.dashboard.inquiries": "My Inquiries",
    "edumatch.dashboard.askQuestion": "Ask a Question",
    "edumatch.dashboard.noInquiries": "No inquiries yet",
    "edumatch.dashboard.askFirst": "Ask your first question",
    "edumatch.dashboard.wallet": "Wallet",
    "edumatch.dashboard.balance": "Available Balance",
    "edumatch.dashboard.pending": "Pending Earnings",
    "edumatch.dashboard.requests": "Quote Requests",
    "edumatch.dashboard.actions": "Quick Actions",
    "edumatch.dashboard.setupStripe": "Setup Stripe Connect",
    "edumatch.dashboard.editProfile": "Edit Profile",

    // Status badges
    "edumatch.status.NEW": "New",
    "edumatch.status.AI_RESPONDED": "AI Responded",
    "edumatch.status.TUTOR_REQUESTED": "Tutor Requested",
    "edumatch.status.BOOKED": "Booked",
    "edumatch.status.CLOSED": "Closed",

    // Student dashboard
    "edumatch.student.signInRequired": "Please sign in",
    "edumatch.student.signIn": "Sign in",
    "edumatch.student.profileMissing.title": "Student profile not set up yet",
    "edumatch.student.profileMissing.desc":
      "You need a student profile before you can submit inquiries. It only takes a few seconds.",
    "edumatch.student.profileMissing.action": "Set up profile",
    "edumatch.student.editProfile": "Edit Profile",
    "edumatch.student.createProfile": "Create Profile",
    "edumatch.student.noInquiries": "No inquiries yet",

    // New inquiry form
    "edumatch.inquiry.new.title": "Ask a Question",
    "edumatch.inquiry.new.backToDashboard": "← Back to Dashboard",
    "edumatch.inquiry.new.step.subject": "Subject & Level",
    "edumatch.inquiry.new.step.question": "Your Question",
    "edumatch.inquiry.new.step.review": "Review",
    "edumatch.inquiry.new.subject.label": "Subject *",
    "edumatch.inquiry.new.subject.placeholder": "Select a subject…",
    "edumatch.inquiry.new.grade.label": "Grade Level *",
    "edumatch.inquiry.new.grade.k12": "K–12 (School)",
    "edumatch.inquiry.new.grade.undergrad": "Undergraduate",
    "edumatch.inquiry.new.grade.grad": "Graduate / Postgrad",
    "edumatch.inquiry.new.next": "Next →",
    "edumatch.inquiry.new.back": "← Back",
    "edumatch.inquiry.new.desc.label": "Describe your question *",
    "edumatch.inquiry.new.desc.placeholder":
      "Describe the problem or concept you need help with. Be as specific as possible — include formulas, chapter numbers, or any context that helps.",
    "edumatch.inquiry.new.desc.tooShort": "{n} more characters needed",
    "edumatch.inquiry.new.desc.ok": "Looks good ✓",
    "edumatch.inquiry.new.reviewBtn": "Review →",
    "edumatch.inquiry.new.reviewTitle": "Review your inquiry",
    "edumatch.inquiry.new.reviewSubject": "Subject",
    "edumatch.inquiry.new.reviewGrade": "Grade Level",
    "edumatch.inquiry.new.reviewQuestion": "Question",
    "edumatch.inquiry.new.reviewNote":
      "After submitting, EduMatch AI will automatically generate an explanation. You can then request tutor quotes.",
    "edumatch.inquiry.new.editBtn": "← Edit",
    "edumatch.inquiry.new.submitBtn": "Submit & Get AI Help",
    "edumatch.inquiry.new.submitting": "Submitting…",
    "edumatch.inquiry.new.change": "Change",
    "edumatch.inquiry.new.profile.title":
      "One more step — create your student profile",
    "edumatch.inquiry.new.profile.desc":
      "Your grade level is already set from your question. Optionally pick subjects you care about, then we'll submit your inquiry automatically.",
    "edumatch.inquiry.new.profile.grade": "Grade Level",
    "edumatch.inquiry.new.profile.subjects": "Subjects of Interest",
    "edumatch.inquiry.new.profile.subjectsOptional": "(optional)",
    "edumatch.inquiry.new.profile.createBtn": "Create Profile & Submit Inquiry",
    "edumatch.inquiry.new.profile.creating": "Creating profile & submitting…",
    "edumatch.inquiry.new.networkError": "Network error. Please try again.",

    // Inquiry detail
    "edumatch.inquiry.detail.backToDashboard": "← Dashboard",
    "edumatch.inquiry.detail.aiTitle": "AI Explanation",
    "edumatch.inquiry.detail.askAi": "Ask AI",
    "edumatch.inquiry.detail.askAgain": "Ask Again",
    "edumatch.inquiry.detail.thinking": "Thinking…",
    "edumatch.inquiry.detail.generating": "Generating AI response…",
    "edumatch.inquiry.detail.askPrompt":
      'Click "Ask AI" to get an explanation from EduMatch AI.',
    "edumatch.inquiry.detail.requestTutors": "Request Tutor Quotes",
    "edumatch.inquiry.detail.requesting": "Requesting…",
    "edumatch.inquiry.detail.viewQuotes": "View Quotes",
    "edumatch.inquiry.detail.dismiss": "dismiss",
    "edumatch.inquiry.detail.aiUnavailable": "AI service unavailable.",
    "edumatch.inquiry.detail.streamInterrupted": "Stream interrupted.",
    "edumatch.inquiry.detail.locationRequired":
      "Location required to find nearby tutors. Please set your home location in your student profile or allow browser location access.",
    "edumatch.inquiry.detail.quoteFailed": "Failed to request quotes.",
    "edumatch.inquiry.detail.quoteSuccess.title": "✅ Request sent to tutors!",
    "edumatch.inquiry.detail.quoteSuccess.notified":
      "{n} tutor has been notified and can now submit a quote. You'll be taken to the quotes page in a moment…",
    "edumatch.inquiry.detail.quoteSuccess.notifiedPlural":
      "{n} tutors have been notified and can now submit a quote. You'll be taken to the quotes page in a moment…",
    "edumatch.inquiry.detail.quoteSuccess.noTutors":
      "No tutors are available nearby right now, but your request has been saved. You'll be taken to the quotes page in a moment…",
    "edumatch.inquiry.detail.moderation.refused":
      "EduMatch AI declined this request.",
    "edumatch.inquiry.detail.moderation.category":
      "Category: {category}. The message below explains what we can help with instead.",

    // Quotes page
    "edumatch.quotes.title": "Tutor Quotes",
    "edumatch.quotes.subtitle":
      "Review quotes from available tutors. Accept one to confirm your booking.",
    "edumatch.quotes.breadcrumb.inquiry": "Inquiry",
    "edumatch.quotes.justRequested.title": "🎉 Your request has been sent!",
    "edumatch.quotes.justRequested.desc":
      "Matching tutors have been notified and can now submit a quote. This page will show their responses as they arrive — quotes are typically sent within a few hours.",
    "edumatch.quotes.justRequested.dismiss": "Dismiss",
    "edumatch.quotes.noQuotes": "No quotes yet.",
    "edumatch.quotes.noQuotesSub":
      "Tutors have been notified — check back soon.",
    "edumatch.quotes.ratePerHour": "Rate / hr",
    "edumatch.quotes.estHours": "Est. Hours",
    "edumatch.quotes.total": "Total",
    "edumatch.quotes.availableSlots": "Available Slots",
    "edumatch.quotes.verified": "✓ Verified",
    "edumatch.quotes.review": "review",
    "edumatch.quotes.reviews": "reviews",
    "edumatch.quotes.accept": "Accept & Book",
    "edumatch.quotes.booking": "Booking…",
    "edumatch.quotes.decline": "Decline",
    "edumatch.quotes.bookingConfirmed": "✓ Booking confirmed",
    "edumatch.quotes.online": "Online",
    "edumatch.quotes.inPerson": "In-Person",
    "edumatch.quotes.noRequestFound":
      "No quote request found. Please go back and request tutor quotes.",

    // Student profile
    "edumatch.profile.student.title.create": "Create Student Profile",
    "edumatch.profile.student.title.edit": "Edit Student Profile",
    "edumatch.profile.student.subtitle.create":
      "Set up your student profile to start asking questions and get matched with tutors.",
    "edumatch.profile.student.subtitle.edit":
      "Update your grade level and subjects of interest.",
    "edumatch.profile.student.backToDashboard": "← Back to Dashboard",
    "edumatch.profile.student.gradeLevel": "Grade Level *",
    "edumatch.profile.student.subjects": "Subjects of Interest",
    "edumatch.profile.student.subjectsHint":
      "Select subjects you're interested in learning. This helps us match you with relevant tutors.",
    "edumatch.profile.student.address.title": "Home Address (Optional)",
    "edumatch.profile.student.address.street": "Street address",
    "edumatch.profile.student.address.city": "City",
    "edumatch.profile.student.address.region": "Region / State",
    "edumatch.profile.student.address.postalCode": "Postal Code",
    "edumatch.profile.student.address.country": "Country",
    "edumatch.profile.student.address.hint":
      "Used for matching with nearby tutors. You can leave this blank and use online-only tutors.",
    "edumatch.profile.student.cancel": "Cancel",
    "edumatch.profile.student.save": "Save Changes",
    "edumatch.profile.student.create": "Create Profile",
    "edumatch.profile.student.saving": "Saving…",
    "edumatch.profile.student.savedOk": "Profile saved successfully!",

    // Tutor dashboard
    "edumatch.tutor.signInRequired": "Please sign in",
    "edumatch.tutor.signIn": "Sign in",
    "edumatch.tutor.profileMissing.title": "Tutor profile not set up yet",
    "edumatch.tutor.profileMissing.desc":
      "You need a tutor profile with your subjects and hourly rate before you can receive quote requests.",
    "edumatch.tutor.profileMissing.action": "Set up profile",
    "edumatch.tutor.stripe.connectTitle": "Connect your bank account",
    "edumatch.tutor.stripe.verifyTitle": "Complete Stripe verification",
    "edumatch.tutor.stripe.connectDesc":
      "Set up Stripe Connect to receive payments from students.",
    "edumatch.tutor.stripe.verifyDesc":
      "Your account is created but needs verification to enable payouts.",
    "edumatch.tutor.stripe.connectAction": "Connect Stripe",
    "edumatch.tutor.stripe.completeAction": "Complete Setup",
    "edumatch.tutor.payout.success":
      "Payout requested successfully! Funds will arrive in 1-2 business days.",
    "edumatch.tutor.dashboard.title": "Tutor Dashboard",
    "edumatch.tutor.dashboard.subtitle":
      "Manage your earnings and quote requests",
    "edumatch.tutor.balance.nextPayout": "Next payout available {date}",
    "edumatch.tutor.balance.pendingNote": "Available 24h after session",
    "edumatch.tutor.balance.requestPayout": "Request Payout",
    "edumatch.tutor.balance.processing": "Processing...",
    "edumatch.tutor.quoteRequests.label": "Quote Requests",
    "edumatch.tutor.quoteRequests.view": "View requests →",
    "edumatch.tutor.transactions.title": "Recent Transactions",
    "edumatch.tutor.transactions.sessionPayment": "Session Payment",
    "edumatch.tutor.transactions.payout": "Payout to Bank",
    "edumatch.tutor.transactions.fee": "Fee:",
    "edumatch.tutor.quickActions.stripeConnected": "Stripe Connected ✓",
    "edumatch.tutor.quickActions.setupStripe": "Setup Stripe Connect",
    "edumatch.tutor.editProfile": "Edit Profile",
    "edumatch.tutor.createProfile": "Create Profile",

    // Tutor profile
    "edumatch.profile.tutor.title.create": "Create Tutor Profile",
    "edumatch.profile.tutor.title.edit": "Edit Tutor Profile",
    "edumatch.profile.tutor.subtitle.create":
      "Set up your tutor profile to start receiving quote requests from students.",
    "edumatch.profile.tutor.subtitle.edit":
      "Update your tutoring details and availability.",
    "edumatch.profile.tutor.backToDashboard": "← Back to Dashboard",
    "edumatch.profile.tutor.bio.label": "Bio",
    "edumatch.profile.tutor.bio.placeholder":
      "Tell students about your teaching experience, qualifications, and approach...",
    "edumatch.profile.tutor.bio.chars": "{n}/2000 characters",
    "edumatch.profile.tutor.subjects.label": "Subjects You Teach *",
    "edumatch.profile.tutor.levels.label": "Grade Levels You Teach *",
    "edumatch.profile.tutor.rate.label": "Hourly Rate (€) *",
    "edumatch.profile.tutor.onlineOnly.label":
      "Online only (no in-person tutoring)",
    "edumatch.profile.tutor.radius.label": "Service Radius (km)",
    "edumatch.profile.tutor.radius.hint":
      "How far you're willing to travel for in-person sessions",
    "edumatch.profile.tutor.address.optional": "Location (Optional)",
    "edumatch.profile.tutor.address.required": "Base Location *",
    "edumatch.profile.tutor.address.street": "Street address",
    "edumatch.profile.tutor.address.city": "City",
    "edumatch.profile.tutor.address.region": "Region / State",
    "edumatch.profile.tutor.address.postalCode": "Postal Code",
    "edumatch.profile.tutor.address.country": "Country",
    "edumatch.profile.tutor.cancel": "Cancel",
    "edumatch.profile.tutor.save": "Save Changes",
    "edumatch.profile.tutor.create": "Create Profile",
    "edumatch.profile.tutor.saving": "Saving…",
    "edumatch.profile.tutor.savedOk": "Profile saved successfully!",

    // Tutor requests
    "edumatch.requests.title": "Quote Requests",
    "edumatch.requests.subtitle":
      "Students near you looking for help in your subjects.",
    "edumatch.requests.open": "Open ({n})",
    "edumatch.requests.quoted": "Already Quoted ({n})",
    "edumatch.requests.noOpen":
      "No open requests matching your subjects right now.",
    "edumatch.requests.expiresIn": "Expires in {n}h",
    "edumatch.requests.distance": "{n} km away",
    "edumatch.requests.online": "Online",
    "edumatch.requests.submitQuote": "Submit Quote",
    "edumatch.requests.hideForm": "Hide Form",
    "edumatch.requests.submitting": "Submitting…",
    "edumatch.requests.rate": "Hourly Rate (€)",
    "edumatch.requests.hours": "Est. Hours",
    "edumatch.requests.slots.title": "Availability Slots",
    "edumatch.requests.slots.add": "+ Add Slot",
    "edumatch.requests.slots.start": "Start",
    "edumatch.requests.slots.end": "End",
    "edumatch.requests.slots.mode.online": "Online",
    "edumatch.requests.slots.mode.inPerson": "In-Person",
    "edumatch.requests.slots.remove": "×",
    "edumatch.requests.notes": "Notes (optional)",
    "edumatch.requests.noSlotError":
      "Add at least one availability slot before submitting.",
    "edumatch.requests.networkError": "Network error. Please try again.",
    "edumatch.requests.addProfile":
      "Add your home address in your tutor profile to see nearby quote requests.",
  },
  nl: {
    // Navigation
    "edumatch.nav.home": "Home",
    "edumatch.nav.student": "Student",
    "edumatch.nav.tutor": "Tutor",
    "edumatch.nav.signIn": "Inloggen",
    "edumatch.nav.signOut": "Uitloggen",

    // Hero
    "edumatch.hero.badge": "Nu Live — Krijg Direct AI Hulp",
    "edumatch.hero.title": "Kom Vooruit met AI + Expert Tutors",
    "edumatch.hero.subtitle":
      "Maak een foto, krijg een AI-uitleg in seconden. Meer hulp nodig? Match met geverifieerde tutors en boek direct.",
    "edumatch.hero.cta.student": "Start als Student",
    "edumatch.hero.cta.tutor": "Word Tutor",
    "edumatch.hero.cta.ask": "Stel een Vraag",
    "edumatch.hero.cta.dashboard": "Naar Dashboard",

    // How it works
    "edumatch.how.title": "Hoe EduMatch Werkt",
    "edumatch.how.step1.title": "Stel je Vraag",
    "edumatch.how.step1.desc":
      "Upload een foto, spraakmemo of typ je vraag. Onze AI begrijpt context en complexiteit.",
    "edumatch.how.step2.title": "Krijg AI Hulp",
    "edumatch.how.step2.desc":
      "Ontvang een gedetailleerde uitleg in seconden. Vervolgvragen zijn gratis.",
    "edumatch.how.step3.title": "Match met Tutors",
    "edumatch.how.step3.desc":
      "Meer hulp nodig? Vraag offertes aan bij geverifieerde lokale tutors. Vergelijk en boek direct.",

    // For Students
    "edumatch.students.section": "Voor Studenten",
    "edumatch.students.title": "Huiswerk Hulp, Herverzonnen",
    "edumatch.students.feature1.title": "AI Uitleg",
    "edumatch.students.feature1.desc":
      "Krijg stap-voor-stap uitleg afgestemd op je niveau en vak.",
    "edumatch.students.feature2.title": "Elk Formaat",
    "edumatch.students.feature2.desc":
      "Upload foto's, spraakmemo of tekst. Wij verwerken afbeeldingen, audio en documenten.",
    "edumatch.students.feature3.title": "Expert Tutors",
    "edumatch.students.feature3.desc":
      "Geverifieerde tutors afgestemd op jouw locatie en vakbehoeften.",
    "edumatch.students.feature4.title": "Veilige Betalingen",
    "edumatch.students.feature4.desc":
      "Veilig afrekenen met Stripe. Betaal alleen bij het boeken van een sessie.",

    // For Tutors
    "edumatch.tutors.section": "Voor Tutors",
    "edumatch.tutors.title": "Verdien met Wat Je Liefhebt",
    "edumatch.tutors.feature1.title": "Bepaal Je Tarief",
    "edumatch.tutors.feature1.desc":
      "Jij bepaalt je uurtarief. Wij voegen een kleine platformfee toe.",
    "edumatch.tutors.feature2.title": "Flexibele Agenda",
    "edumatch.tutors.feature2.desc":
      "Kies wanneer je beschikbaar bent. Studenten boeken tijden die jou uitkomen.",
    "edumatch.tutors.feature3.title": "Snelle Uitbetalingen",
    "edumatch.tutors.feature3.desc":
      "Ontvang betaling op je bankrekening binnen 48 uur na sessievoltooiing.",
    "edumatch.tutors.cta": "Start Vandaag als Tutor",

    // Stats
    "edumatch.stats.questions": "Vragen Beantwoord",
    "edumatch.stats.tutors": "Geverifieerde Tutors",
    "edumatch.stats.satisfaction": "Studenttevredenheid",

    // Final CTA
    "edumatch.cta.title": "Klaar om te Starten?",
    "edumatch.cta.subtitle":
      "Doe mee met duizenden studenten die hulp krijgen en tutors die inkomen verdienen.",
    "edumatch.cta.ask": "Stel een Vraag",
    "edumatch.cta.tutor": "Word Tutor",

    // Footer
    "edumatch.footer.tagline": "AI-first huiswerk hulp en tutor marktplaats.",
    "edumatch.footer.students": "Studenten",
    "edumatch.footer.tutors": "Tutors",
    "edumatch.footer.legal": "Juridisch",
    "edumatch.footer.privacy": "Privacy",
    "edumatch.footer.terms": "Voorwaarden",
    "edumatch.footer.rights": "Alle rechten voorbehouden.",

    // Dashboard
    "edumatch.dashboard.welcome": "Welkom terug",
    "edumatch.dashboard.inquiries": "Mijn Vragen",
    "edumatch.dashboard.askQuestion": "Stel een Vraag",
    "edumatch.dashboard.noInquiries": "Nog geen vragen",
    "edumatch.dashboard.askFirst": "Stel je eerste vraag",
    "edumatch.dashboard.wallet": "Portemonnee",
    "edumatch.dashboard.balance": "Beschikbaar Saldo",
    "edumatch.dashboard.pending": "In Afwachting",
    "edumatch.dashboard.requests": "Offerteverzoeken",
    "edumatch.dashboard.actions": "Snelle Acties",
    "edumatch.dashboard.setupStripe": "Stripe Connect Instellen",
    "edumatch.dashboard.editProfile": "Profiel Bewerken",

    // Status badges
    "edumatch.status.NEW": "Nieuw",
    "edumatch.status.AI_RESPONDED": "AI Beantwoord",
    "edumatch.status.TUTOR_REQUESTED": "Tutor Gevraagd",
    "edumatch.status.BOOKED": "Geboekt",
    "edumatch.status.CLOSED": "Gesloten",

    // Student dashboard
    "edumatch.student.signInRequired": "Log alstublieft in",
    "edumatch.student.signIn": "Inloggen",
    "edumatch.student.profileMissing.title":
      "Studentprofiel nog niet ingesteld",
    "edumatch.student.profileMissing.desc":
      "Je hebt een studentprofiel nodig voordat je vragen kunt indienen. Het duurt maar een paar seconden.",
    "edumatch.student.profileMissing.action": "Profiel instellen",
    "edumatch.student.editProfile": "Profiel Bewerken",
    "edumatch.student.createProfile": "Profiel Aanmaken",
    "edumatch.student.noInquiries": "Nog geen vragen",

    // New inquiry form
    "edumatch.inquiry.new.title": "Stel een Vraag",
    "edumatch.inquiry.new.backToDashboard": "← Terug naar Dashboard",
    "edumatch.inquiry.new.step.subject": "Vak & Niveau",
    "edumatch.inquiry.new.step.question": "Jouw Vraag",
    "edumatch.inquiry.new.step.review": "Controleren",
    "edumatch.inquiry.new.subject.label": "Vak *",
    "edumatch.inquiry.new.subject.placeholder": "Selecteer een vak…",
    "edumatch.inquiry.new.grade.label": "Niveau *",
    "edumatch.inquiry.new.grade.k12": "K–12 (School)",
    "edumatch.inquiry.new.grade.undergrad": "Bachelor",
    "edumatch.inquiry.new.grade.grad": "Master / Postgrad",
    "edumatch.inquiry.new.next": "Volgende →",
    "edumatch.inquiry.new.back": "← Terug",
    "edumatch.inquiry.new.desc.label": "Beschrijf je vraag *",
    "edumatch.inquiry.new.desc.placeholder":
      "Beschrijf het probleem of concept waarmee je hulp nodig hebt. Wees zo specifiek mogelijk — voeg formules, hoofdstuknummers of andere context toe.",
    "edumatch.inquiry.new.desc.tooShort": "Nog {n} tekens nodig",
    "edumatch.inquiry.new.desc.ok": "Ziet er goed uit ✓",
    "edumatch.inquiry.new.reviewBtn": "Controleren →",
    "edumatch.inquiry.new.reviewTitle": "Controleer je vraag",
    "edumatch.inquiry.new.reviewSubject": "Vak",
    "edumatch.inquiry.new.reviewGrade": "Niveau",
    "edumatch.inquiry.new.reviewQuestion": "Vraag",
    "edumatch.inquiry.new.reviewNote":
      "Na het indienen genereert EduMatch AI automatisch een uitleg. Daarna kun je tutoroffertes aanvragen.",
    "edumatch.inquiry.new.editBtn": "← Bewerken",
    "edumatch.inquiry.new.submitBtn": "Indienen & AI Hulp Ontvangen",
    "edumatch.inquiry.new.submitting": "Indienen…",
    "edumatch.inquiry.new.change": "Wijzigen",
    "edumatch.inquiry.new.profile.title":
      "Nog één stap — maak je studentprofiel aan",
    "edumatch.inquiry.new.profile.desc":
      "Je niveau is al ingesteld vanuit je vraag. Kies optioneel vakken die je interesseren, dan dienen we je vraag automatisch in.",
    "edumatch.inquiry.new.profile.grade": "Niveau",
    "edumatch.inquiry.new.profile.subjects": "Interessegebieden",
    "edumatch.inquiry.new.profile.subjectsOptional": "(optioneel)",
    "edumatch.inquiry.new.profile.createBtn":
      "Profiel Aanmaken & Vraag Indienen",
    "edumatch.inquiry.new.profile.creating": "Profiel aanmaken & indienen…",
    "edumatch.inquiry.new.networkError": "Netwerkfout. Probeer het opnieuw.",

    // Inquiry detail
    "edumatch.inquiry.detail.backToDashboard": "← Dashboard",
    "edumatch.inquiry.detail.aiTitle": "AI Uitleg",
    "edumatch.inquiry.detail.askAi": "AI Vragen",
    "edumatch.inquiry.detail.askAgain": "Opnieuw Vragen",
    "edumatch.inquiry.detail.thinking": "Nadenken…",
    "edumatch.inquiry.detail.generating": "AI-antwoord genereren…",
    "edumatch.inquiry.detail.askPrompt":
      'Klik op "AI Vragen" voor een uitleg van EduMatch AI.',
    "edumatch.inquiry.detail.requestTutors": "Tutoroffertes Aanvragen",
    "edumatch.inquiry.detail.requesting": "Aanvragen…",
    "edumatch.inquiry.detail.viewQuotes": "Offertes Bekijken",
    "edumatch.inquiry.detail.dismiss": "sluiten",
    "edumatch.inquiry.detail.aiUnavailable": "AI-dienst niet beschikbaar.",
    "edumatch.inquiry.detail.streamInterrupted": "Stroom onderbroken.",
    "edumatch.inquiry.detail.locationRequired":
      "Locatie vereist om tutors in de buurt te vinden. Stel je thuislocatie in je studentprofiel in of sta browsertoegang tot locatie toe.",
    "edumatch.inquiry.detail.quoteFailed": "Offerteaanvraag mislukt.",
    "edumatch.inquiry.detail.quoteSuccess.title":
      "✅ Aanvraag verzonden naar tutors!",
    "edumatch.inquiry.detail.quoteSuccess.notified":
      "{n} tutor is geïnformeerd en kan nu een offerte indienen. Je wordt zo meteen naar de offertepagina gebracht…",
    "edumatch.inquiry.detail.quoteSuccess.notifiedPlural":
      "{n} tutors zijn geïnformeerd en kunnen nu een offerte indienen. Je wordt zo meteen naar de offertepagina gebracht…",
    "edumatch.inquiry.detail.quoteSuccess.noTutors":
      "Er zijn momenteel geen tutors beschikbaar in de buurt, maar je aanvraag is opgeslagen. Je wordt zo meteen naar de offertepagina gebracht…",
    "edumatch.inquiry.detail.moderation.refused":
      "EduMatch AI heeft dit verzoek afgewezen.",
    "edumatch.inquiry.detail.moderation.category":
      "Categorie: {category}. Het onderstaande bericht legt uit waarmee we in plaats daarvan kunnen helpen.",

    // Quotes page
    "edumatch.quotes.title": "Tutoroffertes",
    "edumatch.quotes.subtitle":
      "Bekijk offertes van beschikbare tutors. Accepteer één om je boeking te bevestigen.",
    "edumatch.quotes.breadcrumb.inquiry": "Vraag",
    "edumatch.quotes.justRequested.title": "🎉 Je aanvraag is verzonden!",
    "edumatch.quotes.justRequested.desc":
      "Beschikbare tutors zijn geïnformeerd en kunnen nu een offerte indienen. Deze pagina toont hun reacties zodra ze binnenkomen — offertes worden doorgaans binnen enkele uren verzonden.",
    "edumatch.quotes.justRequested.dismiss": "Sluiten",
    "edumatch.quotes.noQuotes": "Nog geen offertes.",
    "edumatch.quotes.noQuotesSub": "Tutors zijn geïnformeerd — kom snel terug.",
    "edumatch.quotes.ratePerHour": "Tarief / uur",
    "edumatch.quotes.estHours": "Geschatte uren",
    "edumatch.quotes.total": "Totaal",
    "edumatch.quotes.availableSlots": "Beschikbare tijdslots",
    "edumatch.quotes.verified": "✓ Geverifieerd",
    "edumatch.quotes.review": "beoordeling",
    "edumatch.quotes.reviews": "beoordelingen",
    "edumatch.quotes.accept": "Accepteren & Boeken",
    "edumatch.quotes.booking": "Boeken…",
    "edumatch.quotes.decline": "Afwijzen",
    "edumatch.quotes.bookingConfirmed": "✓ Boeking bevestigd",
    "edumatch.quotes.online": "Online",
    "edumatch.quotes.inPerson": "In persoon",
    "edumatch.quotes.noRequestFound":
      "Geen offerteaanvraag gevonden. Ga terug en vraag tutoroffertes aan.",

    // Student profile
    "edumatch.profile.student.title.create": "Studentprofiel Aanmaken",
    "edumatch.profile.student.title.edit": "Studentprofiel Bewerken",
    "edumatch.profile.student.subtitle.create":
      "Stel je studentprofiel in om vragen te stellen en gekoppeld te worden aan tutors.",
    "edumatch.profile.student.subtitle.edit":
      "Werk je niveau en interessegebieden bij.",
    "edumatch.profile.student.backToDashboard": "← Terug naar Dashboard",
    "edumatch.profile.student.gradeLevel": "Niveau *",
    "edumatch.profile.student.subjects": "Interessegebieden",
    "edumatch.profile.student.subjectsHint":
      "Selecteer vakken waarin je geïnteresseerd bent. Dit helpt ons je te koppelen aan relevante tutors.",
    "edumatch.profile.student.address.title": "Thuisadres (Optioneel)",
    "edumatch.profile.student.address.street": "Straatnaam",
    "edumatch.profile.student.address.city": "Stad",
    "edumatch.profile.student.address.region": "Provincie / Staat",
    "edumatch.profile.student.address.postalCode": "Postcode",
    "edumatch.profile.student.address.country": "Land",
    "edumatch.profile.student.address.hint":
      "Gebruikt voor koppeling met tutors in de buurt. Je kunt dit leeg laten en alleen online tutors gebruiken.",
    "edumatch.profile.student.cancel": "Annuleren",
    "edumatch.profile.student.save": "Wijzigingen Opslaan",
    "edumatch.profile.student.create": "Profiel Aanmaken",
    "edumatch.profile.student.saving": "Opslaan…",
    "edumatch.profile.student.savedOk": "Profiel succesvol opgeslagen!",

    // Tutor dashboard
    "edumatch.tutor.signInRequired": "Log alstublieft in",
    "edumatch.tutor.signIn": "Inloggen",
    "edumatch.tutor.profileMissing.title": "Tutorprofiel nog niet ingesteld",
    "edumatch.tutor.profileMissing.desc":
      "Je hebt een tutorprofiel met je vakken en uurtarief nodig voordat je offerteaanvragen kunt ontvangen.",
    "edumatch.tutor.profileMissing.action": "Profiel instellen",
    "edumatch.tutor.stripe.connectTitle": "Koppel je bankrekening",
    "edumatch.tutor.stripe.verifyTitle": "Voltooi Stripe-verificatie",
    "edumatch.tutor.stripe.connectDesc":
      "Stel Stripe Connect in om betalingen van studenten te ontvangen.",
    "edumatch.tutor.stripe.verifyDesc":
      "Je account is aangemaakt maar moet worden geverifieerd om uitbetalingen mogelijk te maken.",
    "edumatch.tutor.stripe.connectAction": "Stripe Koppelen",
    "edumatch.tutor.stripe.completeAction": "Instelling Voltooien",
    "edumatch.tutor.payout.success":
      "Uitbetaling succesvol aangevraagd! Geld arriveert binnen 1-2 werkdagen.",
    "edumatch.tutor.dashboard.title": "Tutordashboard",
    "edumatch.tutor.dashboard.subtitle":
      "Beheer je inkomsten en offerteaanvragen",
    "edumatch.tutor.balance.nextPayout":
      "Volgende uitbetaling beschikbaar {date}",
    "edumatch.tutor.balance.pendingNote": "Beschikbaar 24u na sessie",
    "edumatch.tutor.balance.requestPayout": "Uitbetaling Aanvragen",
    "edumatch.tutor.balance.processing": "Verwerken...",
    "edumatch.tutor.quoteRequests.label": "Offerteaanvragen",
    "edumatch.tutor.quoteRequests.view": "Aanvragen bekijken →",
    "edumatch.tutor.transactions.title": "Recente Transacties",
    "edumatch.tutor.transactions.sessionPayment": "Sessiebetaling",
    "edumatch.tutor.transactions.payout": "Uitbetaling naar Bank",
    "edumatch.tutor.transactions.fee": "Kosten:",
    "edumatch.tutor.quickActions.stripeConnected": "Stripe Gekoppeld ✓",
    "edumatch.tutor.quickActions.setupStripe": "Stripe Connect Instellen",
    "edumatch.tutor.editProfile": "Profiel Bewerken",
    "edumatch.tutor.createProfile": "Profiel Aanmaken",

    // Tutor profile
    "edumatch.profile.tutor.title.create": "Tutorprofiel Aanmaken",
    "edumatch.profile.tutor.title.edit": "Tutorprofiel Bewerken",
    "edumatch.profile.tutor.subtitle.create":
      "Stel je tutorprofiel in om offerteaanvragen van studenten te ontvangen.",
    "edumatch.profile.tutor.subtitle.edit":
      "Werk je tutordetails en beschikbaarheid bij.",
    "edumatch.profile.tutor.backToDashboard": "← Terug naar Dashboard",
    "edumatch.profile.tutor.bio.label": "Bio",
    "edumatch.profile.tutor.bio.placeholder":
      "Vertel studenten over je onderwijservaring, kwalificaties en aanpak...",
    "edumatch.profile.tutor.bio.chars": "{n}/2000 tekens",
    "edumatch.profile.tutor.subjects.label": "Vakken die je Geeft *",
    "edumatch.profile.tutor.levels.label": "Niveaus die je Geeft *",
    "edumatch.profile.tutor.rate.label": "Uurtarief (€) *",
    "edumatch.profile.tutor.onlineOnly.label":
      "Alleen online (geen persoonlijke lessen)",
    "edumatch.profile.tutor.radius.label": "Serviceradius (km)",
    "edumatch.profile.tutor.radius.hint":
      "Hoe ver je bereid bent te reizen voor persoonlijke sessies",
    "edumatch.profile.tutor.address.optional": "Locatie (Optioneel)",
    "edumatch.profile.tutor.address.required": "Basislocatie *",
    "edumatch.profile.tutor.address.street": "Straatnaam",
    "edumatch.profile.tutor.address.city": "Stad",
    "edumatch.profile.tutor.address.region": "Provincie / Staat",
    "edumatch.profile.tutor.address.postalCode": "Postcode",
    "edumatch.profile.tutor.address.country": "Land",
    "edumatch.profile.tutor.cancel": "Annuleren",
    "edumatch.profile.tutor.save": "Wijzigingen Opslaan",
    "edumatch.profile.tutor.create": "Profiel Aanmaken",
    "edumatch.profile.tutor.saving": "Opslaan…",
    "edumatch.profile.tutor.savedOk": "Profiel succesvol opgeslagen!",

    // Tutor requests
    "edumatch.requests.title": "Offerteaanvragen",
    "edumatch.requests.subtitle":
      "Studenten bij jou in de buurt die hulp zoeken bij jouw vakken.",
    "edumatch.requests.open": "Open ({n})",
    "edumatch.requests.quoted": "Al Geoffreerd ({n})",
    "edumatch.requests.noOpen":
      "Momenteel geen open aanvragen die overeenkomen met jouw vakken.",
    "edumatch.requests.expiresIn": "Verloopt over {n}u",
    "edumatch.requests.distance": "{n} km afstand",
    "edumatch.requests.online": "Online",
    "edumatch.requests.submitQuote": "Offerte Indienen",
    "edumatch.requests.hideForm": "Formulier Verbergen",
    "edumatch.requests.submitting": "Indienen…",
    "edumatch.requests.rate": "Uurtarief (€)",
    "edumatch.requests.hours": "Geschatte uren",
    "edumatch.requests.slots.title": "Beschikbare Tijdslots",
    "edumatch.requests.slots.add": "+ Slot Toevoegen",
    "edumatch.requests.slots.start": "Begin",
    "edumatch.requests.slots.end": "Einde",
    "edumatch.requests.slots.mode.online": "Online",
    "edumatch.requests.slots.mode.inPerson": "In Persoon",
    "edumatch.requests.slots.remove": "×",
    "edumatch.requests.notes": "Opmerkingen (optioneel)",
    "edumatch.requests.noSlotError":
      "Voeg minimaal één tijdslot toe voordat je indient.",
    "edumatch.requests.networkError": "Netwerkfout. Probeer het opnieuw.",
    "edumatch.requests.addProfile":
      "Voeg je thuisadres toe in je tutorprofiel om aanvragen in de buurt te zien.",
  },
  fr: {
    // Navigation
    "edumatch.nav.home": "Accueil",
    "edumatch.nav.student": "Étudiant",
    "edumatch.nav.tutor": "Tuteur",
    "edumatch.nav.signIn": "Connexion",
    "edumatch.nav.signOut": "Déconnexion",

    // Hero
    "edumatch.hero.badge": "En Direct — Obtenez de l'Aide IA Instantanément",
    "edumatch.hero.title": "Débloquez avec l'IA + Tuteurs Experts",
    "edumatch.hero.subtitle":
      "Prenez une photo, obtenez une explication IA en secondes. Besoin d'aide approfondie ? Matchez avec des tuteurs vérifiés et réservez instantanément.",
    "edumatch.hero.cta.student": "Commencer comme Étudiant",
    "edumatch.hero.cta.tutor": "Devenir Tuteur",
    "edumatch.hero.cta.ask": "Poser une Question",
    "edumatch.hero.cta.dashboard": "Aller au Tableau de Bord",

    // How it works
    "edumatch.how.title": "Comment Fonctionne EduMatch",
    "edumatch.how.step1.title": "Posez votre Question",
    "edumatch.how.step1.desc":
      "Téléchargez une photo, note vocale ou tapez votre question. Notre IA comprend le contexte et la complexité.",
    "edumatch.how.step2.title": "Obtenez l'Aide IA",
    "edumatch.how.step2.desc":
      "Recevez une explication détaillée en secondes. Les questions de suivi sont gratuites.",
    "edumatch.how.step3.title": "Matchez avec des Tuteurs",
    "edumatch.how.step3.desc":
      "Besoin de plus d'aide ? Demandez des devis à des tuteurs locaux vérifiés. Comparez et réservez instantanément.",

    // For Students
    "edumatch.students.section": "Pour Étudiants",
    "edumatch.students.title": "Aide aux Devoirs, Réinventée",
    "edumatch.students.feature1.title": "Explications IA",
    "edumatch.students.feature1.desc":
      "Obtenez des explications pas à pas adaptées à votre niveau et matière.",
    "edumatch.students.feature2.title": "Tout Format",
    "edumatch.students.feature2.desc":
      "Téléchargez photos, notes vocales ou texte. Nous gérons images, audio et documents.",
    "edumatch.students.feature3.title": "Tuteurs Experts",
    "edumatch.students.feature3.desc":
      "Tuteurs vérifiés correspondant à votre localisation et besoins.",
    "edumatch.students.feature4.title": "Paiements Sécurisés",
    "edumatch.students.feature4.desc":
      "Paiement sécurisé avec Stripe. Payez uniquement lors de la réservation.",

    // For Tutors
    "edumatch.tutors.section": "Pour Tuteurs",
    "edumatch.tutors.title": "Gagnez en Enseignant ce que vous Aimez",
    "edumatch.tutors.feature1.title": "Fixez votre Tarif",
    "edumatch.tutors.feature1.desc":
      "Vous contrôlez votre tarif horaire. Nous ajoutons une petite commission.",
    "edumatch.tutors.feature2.title": "Horaires Flexibles",
    "edumatch.tutors.feature2.desc":
      "Choisissez vos disponibilités. Les étudiants réservent quand cela vous arrange.",
    "edumatch.tutors.feature3.title": "Paiements Rapides",
    "edumatch.tutors.feature3.desc":
      "Recevez l'argent sur votre compte sous 48h après la session.",
    "edumatch.tutors.cta": "Commencer à Tuter Aujourd'hui",

    // Stats
    "edumatch.stats.questions": "Questions Répondues",
    "edumatch.stats.tutors": "Tuteurs Vérifiés",
    "edumatch.stats.satisfaction": "Satisfaction Étudiants",

    // Final CTA
    "edumatch.cta.title": "Prêt à Commencer ?",
    "edumatch.cta.subtitle": "Rejoignez des milliers d'étudiants et tuteurs.",
    "edumatch.cta.ask": "Poser une Question",
    "edumatch.cta.tutor": "Devenir Tuteur",

    // Footer
    "edumatch.footer.tagline": "Aide aux devoirs IA et marketplace de tuteurs.",
    "edumatch.footer.students": "Étudiants",
    "edumatch.footer.tutors": "Tuteurs",
    "edumatch.footer.legal": "Légal",
    "edumatch.footer.privacy": "Confidentialité",
    "edumatch.footer.terms": "Conditions",
    "edumatch.footer.rights": "Tous droits réservés.",

    // Dashboard
    "edumatch.dashboard.welcome": "Bon retour",
    "edumatch.dashboard.inquiries": "Mes Questions",
    "edumatch.dashboard.askQuestion": "Poser une Question",
    "edumatch.dashboard.noInquiries": "Pas encore de questions",
    "edumatch.dashboard.askFirst": "Posez votre première question",
    "edumatch.dashboard.wallet": "Portefeuille",
    "edumatch.dashboard.balance": "Solde Disponible",
    "edumatch.dashboard.pending": "En Attente",
    "edumatch.dashboard.requests": "Demandes de Devis",
    "edumatch.dashboard.actions": "Actions Rapides",
    "edumatch.dashboard.setupStripe": "Configurer Stripe Connect",
    "edumatch.dashboard.editProfile": "Modifier le Profil",

    // Status badges
    "edumatch.status.NEW": "Nouveau",
    "edumatch.status.AI_RESPONDED": "IA Répondu",
    "edumatch.status.TUTOR_REQUESTED": "Tuteur Demandé",
    "edumatch.status.BOOKED": "Réservé",
    "edumatch.status.CLOSED": "Fermé",

    // Student dashboard
    "edumatch.student.signInRequired": "Veuillez vous connecter",
    "edumatch.student.signIn": "Se connecter",
    "edumatch.student.profileMissing.title":
      "Profil étudiant non encore configuré",
    "edumatch.student.profileMissing.desc":
      "Vous avez besoin d'un profil étudiant avant de pouvoir soumettre des questions. Cela ne prend que quelques secondes.",
    "edumatch.student.profileMissing.action": "Configurer le profil",
    "edumatch.student.editProfile": "Modifier le Profil",
    "edumatch.student.createProfile": "Créer un Profil",
    "edumatch.student.noInquiries": "Aucune question pour l'instant",

    // New inquiry form
    "edumatch.inquiry.new.title": "Poser une Question",
    "edumatch.inquiry.new.backToDashboard": "← Retour au Tableau de Bord",
    "edumatch.inquiry.new.step.subject": "Matière & Niveau",
    "edumatch.inquiry.new.step.question": "Votre Question",
    "edumatch.inquiry.new.step.review": "Révision",
    "edumatch.inquiry.new.subject.label": "Matière *",
    "edumatch.inquiry.new.subject.placeholder": "Sélectionnez une matière…",
    "edumatch.inquiry.new.grade.label": "Niveau *",
    "edumatch.inquiry.new.grade.k12": "K–12 (École)",
    "edumatch.inquiry.new.grade.undergrad": "Licence",
    "edumatch.inquiry.new.grade.grad": "Master / Doctorat",
    "edumatch.inquiry.new.next": "Suivant →",
    "edumatch.inquiry.new.back": "← Retour",
    "edumatch.inquiry.new.desc.label": "Décrivez votre question *",
    "edumatch.inquiry.new.desc.placeholder":
      "Décrivez le problème ou le concept pour lequel vous avez besoin d'aide. Soyez aussi précis que possible — incluez des formules, des numéros de chapitre ou tout contexte utile.",
    "edumatch.inquiry.new.desc.tooShort":
      "{n} caractères supplémentaires nécessaires",
    "edumatch.inquiry.new.desc.ok": "Ça semble bon ✓",
    "edumatch.inquiry.new.reviewBtn": "Réviser →",
    "edumatch.inquiry.new.reviewTitle": "Vérifiez votre question",
    "edumatch.inquiry.new.reviewSubject": "Matière",
    "edumatch.inquiry.new.reviewGrade": "Niveau",
    "edumatch.inquiry.new.reviewQuestion": "Question",
    "edumatch.inquiry.new.reviewNote":
      "Après soumission, EduMatch AI génèrera automatiquement une explication. Vous pourrez ensuite demander des devis de tuteurs.",
    "edumatch.inquiry.new.editBtn": "← Modifier",
    "edumatch.inquiry.new.submitBtn": "Soumettre & Obtenir l'Aide IA",
    "edumatch.inquiry.new.submitting": "Soumission en cours…",
    "edumatch.inquiry.new.change": "Modifier",
    "edumatch.inquiry.new.profile.title":
      "Une dernière étape — créez votre profil étudiant",
    "edumatch.inquiry.new.profile.desc":
      "Votre niveau est déjà défini à partir de votre question. Choisissez optionnellement des matières qui vous intéressent, puis nous soumettrons automatiquement votre question.",
    "edumatch.inquiry.new.profile.grade": "Niveau",
    "edumatch.inquiry.new.profile.subjects": "Matières d'intérêt",
    "edumatch.inquiry.new.profile.subjectsOptional": "(optionnel)",
    "edumatch.inquiry.new.profile.createBtn":
      "Créer un Profil & Soumettre la Question",
    "edumatch.inquiry.new.profile.creating": "Création du profil & soumission…",
    "edumatch.inquiry.new.networkError": "Erreur réseau. Veuillez réessayer.",

    // Inquiry detail
    "edumatch.inquiry.detail.backToDashboard": "← Tableau de Bord",
    "edumatch.inquiry.detail.aiTitle": "Explication IA",
    "edumatch.inquiry.detail.askAi": "Demander à l'IA",
    "edumatch.inquiry.detail.askAgain": "Demander à Nouveau",
    "edumatch.inquiry.detail.thinking": "Réflexion en cours…",
    "edumatch.inquiry.detail.generating": "Génération de la réponse IA…",
    "edumatch.inquiry.detail.askPrompt":
      "Cliquez sur \"Demander à l'IA\" pour obtenir une explication d'EduMatch AI.",
    "edumatch.inquiry.detail.requestTutors": "Demander des Devis de Tuteurs",
    "edumatch.inquiry.detail.requesting": "Demande en cours…",
    "edumatch.inquiry.detail.viewQuotes": "Voir les Devis",
    "edumatch.inquiry.detail.dismiss": "fermer",
    "edumatch.inquiry.detail.aiUnavailable": "Service IA indisponible.",
    "edumatch.inquiry.detail.streamInterrupted": "Flux interrompu.",
    "edumatch.inquiry.detail.locationRequired":
      "Localisation requise pour trouver des tuteurs à proximité. Veuillez définir votre adresse domicile dans votre profil étudiant ou autoriser l'accès à la localisation du navigateur.",
    "edumatch.inquiry.detail.quoteFailed": "Échec de la demande de devis.",
    "edumatch.inquiry.detail.quoteSuccess.title":
      "✅ Demande envoyée aux tuteurs !",
    "edumatch.inquiry.detail.quoteSuccess.notified":
      "{n} tuteur a été notifié et peut maintenant soumettre un devis. Vous serez redirigé vers la page des devis dans un instant…",
    "edumatch.inquiry.detail.quoteSuccess.notifiedPlural":
      "{n} tuteurs ont été notifiés et peuvent maintenant soumettre un devis. Vous serez redirigé vers la page des devis dans un instant…",
    "edumatch.inquiry.detail.quoteSuccess.noTutors":
      "Aucun tuteur n'est disponible à proximité pour l'instant, mais votre demande a été sauvegardée. Vous serez redirigé vers la page des devis dans un instant…",
    "edumatch.inquiry.detail.moderation.refused":
      "EduMatch AI a refusé cette demande.",
    "edumatch.inquiry.detail.moderation.category":
      "Catégorie : {category}. Le message ci-dessous explique ce avec quoi nous pouvons vous aider à la place.",

    // Quotes page
    "edumatch.quotes.title": "Devis de Tuteurs",
    "edumatch.quotes.subtitle":
      "Consultez les devis des tuteurs disponibles. Acceptez-en un pour confirmer votre réservation.",
    "edumatch.quotes.breadcrumb.inquiry": "Question",
    "edumatch.quotes.justRequested.title": "🎉 Votre demande a été envoyée !",
    "edumatch.quotes.justRequested.desc":
      "Les tuteurs correspondants ont été notifiés et peuvent maintenant soumettre un devis. Cette page affichera leurs réponses dès qu'elles arrivent — les devis sont généralement envoyés en quelques heures.",
    "edumatch.quotes.justRequested.dismiss": "Fermer",
    "edumatch.quotes.noQuotes": "Aucun devis pour l'instant.",
    "edumatch.quotes.noQuotesSub":
      "Les tuteurs ont été notifiés — revenez bientôt.",
    "edumatch.quotes.ratePerHour": "Tarif / h",
    "edumatch.quotes.estHours": "Heures est.",
    "edumatch.quotes.total": "Total",
    "edumatch.quotes.availableSlots": "Créneaux disponibles",
    "edumatch.quotes.verified": "✓ Vérifié",
    "edumatch.quotes.review": "avis",
    "edumatch.quotes.reviews": "avis",
    "edumatch.quotes.accept": "Accepter & Réserver",
    "edumatch.quotes.booking": "Réservation…",
    "edumatch.quotes.decline": "Refuser",
    "edumatch.quotes.bookingConfirmed": "✓ Réservation confirmée",
    "edumatch.quotes.online": "En ligne",
    "edumatch.quotes.inPerson": "En personne",
    "edumatch.quotes.noRequestFound":
      "Aucune demande de devis trouvée. Veuillez revenir en arrière et demander des devis de tuteurs.",

    // Student profile
    "edumatch.profile.student.title.create": "Créer un Profil Étudiant",
    "edumatch.profile.student.title.edit": "Modifier le Profil Étudiant",
    "edumatch.profile.student.subtitle.create":
      "Configurez votre profil étudiant pour commencer à poser des questions et être mis en relation avec des tuteurs.",
    "edumatch.profile.student.subtitle.edit":
      "Mettez à jour votre niveau et vos matières d'intérêt.",
    "edumatch.profile.student.backToDashboard": "← Retour au Tableau de Bord",
    "edumatch.profile.student.gradeLevel": "Niveau *",
    "edumatch.profile.student.subjects": "Matières d'intérêt",
    "edumatch.profile.student.subjectsHint":
      "Sélectionnez les matières qui vous intéressent. Cela nous aide à vous mettre en relation avec des tuteurs pertinents.",
    "edumatch.profile.student.address.title":
      "Adresse Personnelle (Optionnelle)",
    "edumatch.profile.student.address.street": "Adresse",
    "edumatch.profile.student.address.city": "Ville",
    "edumatch.profile.student.address.region": "Région / État",
    "edumatch.profile.student.address.postalCode": "Code Postal",
    "edumatch.profile.student.address.country": "Pays",
    "edumatch.profile.student.address.hint":
      "Utilisé pour la mise en relation avec des tuteurs à proximité. Vous pouvez laisser ceci vide et utiliser uniquement des tuteurs en ligne.",
    "edumatch.profile.student.cancel": "Annuler",
    "edumatch.profile.student.save": "Enregistrer les Modifications",
    "edumatch.profile.student.create": "Créer un Profil",
    "edumatch.profile.student.saving": "Enregistrement…",
    "edumatch.profile.student.savedOk": "Profil enregistré avec succès !",

    // Tutor dashboard
    "edumatch.tutor.signInRequired": "Veuillez vous connecter",
    "edumatch.tutor.signIn": "Se connecter",
    "edumatch.tutor.profileMissing.title": "Profil tuteur non encore configuré",
    "edumatch.tutor.profileMissing.desc":
      "Vous avez besoin d'un profil tuteur avec vos matières et votre tarif horaire avant de pouvoir recevoir des demandes de devis.",
    "edumatch.tutor.profileMissing.action": "Configurer le profil",
    "edumatch.tutor.stripe.connectTitle": "Connectez votre compte bancaire",
    "edumatch.tutor.stripe.verifyTitle": "Terminer la vérification Stripe",
    "edumatch.tutor.stripe.connectDesc":
      "Configurez Stripe Connect pour recevoir des paiements des étudiants.",
    "edumatch.tutor.stripe.verifyDesc":
      "Votre compte est créé mais nécessite une vérification pour activer les paiements.",
    "edumatch.tutor.stripe.connectAction": "Connecter Stripe",
    "edumatch.tutor.stripe.completeAction": "Terminer la Configuration",
    "edumatch.tutor.payout.success":
      "Paiement demandé avec succès ! Les fonds arriveront dans 1 à 2 jours ouvrables.",
    "edumatch.tutor.dashboard.title": "Tableau de Bord Tuteur",
    "edumatch.tutor.dashboard.subtitle":
      "Gérez vos revenus et demandes de devis",
    "edumatch.tutor.balance.nextPayout": "Prochain paiement disponible {date}",
    "edumatch.tutor.balance.pendingNote": "Disponible 24h après la session",
    "edumatch.tutor.balance.requestPayout": "Demander un Paiement",
    "edumatch.tutor.balance.processing": "Traitement en cours...",
    "edumatch.tutor.quoteRequests.label": "Demandes de Devis",
    "edumatch.tutor.quoteRequests.view": "Voir les demandes →",
    "edumatch.tutor.transactions.title": "Transactions Récentes",
    "edumatch.tutor.transactions.sessionPayment": "Paiement de Session",
    "edumatch.tutor.transactions.payout": "Virement Bancaire",
    "edumatch.tutor.transactions.fee": "Frais :",
    "edumatch.tutor.quickActions.stripeConnected": "Stripe Connecté ✓",
    "edumatch.tutor.quickActions.setupStripe": "Configurer Stripe Connect",
    "edumatch.tutor.editProfile": "Modifier le Profil",
    "edumatch.tutor.createProfile": "Créer un Profil",

    // Tutor profile
    "edumatch.profile.tutor.title.create": "Créer un Profil Tuteur",
    "edumatch.profile.tutor.title.edit": "Modifier le Profil Tuteur",
    "edumatch.profile.tutor.subtitle.create":
      "Configurez votre profil tuteur pour commencer à recevoir des demandes de devis des étudiants.",
    "edumatch.profile.tutor.subtitle.edit":
      "Mettez à jour vos détails de tutorat et votre disponibilité.",
    "edumatch.profile.tutor.backToDashboard": "← Retour au Tableau de Bord",
    "edumatch.profile.tutor.bio.label": "Biographie",
    "edumatch.profile.tutor.bio.placeholder":
      "Parlez aux étudiants de votre expérience d'enseignement, de vos qualifications et de votre approche...",
    "edumatch.profile.tutor.bio.chars": "{n}/2000 caractères",
    "edumatch.profile.tutor.subjects.label": "Matières que vous Enseignez *",
    "edumatch.profile.tutor.levels.label": "Niveaux que vous Enseignez *",
    "edumatch.profile.tutor.rate.label": "Tarif Horaire (€) *",
    "edumatch.profile.tutor.onlineOnly.label":
      "En ligne uniquement (pas de cours en personne)",
    "edumatch.profile.tutor.radius.label": "Rayon de Service (km)",
    "edumatch.profile.tutor.radius.hint":
      "La distance que vous êtes prêt à parcourir pour des sessions en personne",
    "edumatch.profile.tutor.address.optional": "Localisation (Optionnelle)",
    "edumatch.profile.tutor.address.required": "Localisation de Base *",
    "edumatch.profile.tutor.address.street": "Adresse",
    "edumatch.profile.tutor.address.city": "Ville",
    "edumatch.profile.tutor.address.region": "Région / État",
    "edumatch.profile.tutor.address.postalCode": "Code Postal",
    "edumatch.profile.tutor.address.country": "Pays",
    "edumatch.profile.tutor.cancel": "Annuler",
    "edumatch.profile.tutor.save": "Enregistrer les Modifications",
    "edumatch.profile.tutor.create": "Créer un Profil",
    "edumatch.profile.tutor.saving": "Enregistrement…",
    "edumatch.profile.tutor.savedOk": "Profil enregistré avec succès !",

    // Tutor requests
    "edumatch.requests.title": "Demandes de Devis",
    "edumatch.requests.subtitle":
      "Étudiants près de vous cherchant de l'aide dans vos matières.",
    "edumatch.requests.open": "Ouvert ({n})",
    "edumatch.requests.quoted": "Déjà Devisé ({n})",
    "edumatch.requests.noOpen":
      "Aucune demande ouverte correspondant à vos matières pour l'instant.",
    "edumatch.requests.expiresIn": "Expire dans {n}h",
    "edumatch.requests.distance": "{n} km de distance",
    "edumatch.requests.online": "En ligne",
    "edumatch.requests.submitQuote": "Soumettre un Devis",
    "edumatch.requests.hideForm": "Masquer le Formulaire",
    "edumatch.requests.submitting": "Soumission en cours…",
    "edumatch.requests.rate": "Tarif Horaire (€)",
    "edumatch.requests.hours": "Heures est.",
    "edumatch.requests.slots.title": "Créneaux de Disponibilité",
    "edumatch.requests.slots.add": "+ Ajouter un Créneau",
    "edumatch.requests.slots.start": "Début",
    "edumatch.requests.slots.end": "Fin",
    "edumatch.requests.slots.mode.online": "En ligne",
    "edumatch.requests.slots.mode.inPerson": "En personne",
    "edumatch.requests.slots.remove": "×",
    "edumatch.requests.notes": "Notes (optionnel)",
    "edumatch.requests.noSlotError":
      "Ajoutez au moins un créneau de disponibilité avant de soumettre.",
    "edumatch.requests.networkError": "Erreur réseau. Veuillez réessayer.",
    "edumatch.requests.addProfile":
      "Ajoutez votre adresse personnelle dans votre profil tuteur pour voir les demandes à proximité.",
  },
  de: {
    // Navigation
    "edumatch.nav.home": "Startseite",
    "edumatch.nav.student": "Student",
    "edumatch.nav.tutor": "Tutor",
    "edumatch.nav.signIn": "Anmelden",
    "edumatch.nav.signOut": "Abmelden",

    // Hero
    "edumatch.hero.badge": "Jetzt Live — Sofortige KI-Hilfe",
    "edumatch.hero.title": "Mit KI + Experten-Tutoren Weiterkommen",
    "edumatch.hero.subtitle":
      "Foto machen, KI-Erklärung in Sekunden erhalten. Mehr Hilfe nötig? Match mit geprüften Tutoren und sofort buchen.",
    "edumatch.hero.cta.student": "Als Student Starten",
    "edumatch.hero.cta.tutor": "Tutor Werden",
    "edumatch.hero.cta.ask": "Frage Stellen",
    "edumatch.hero.cta.dashboard": "Zum Dashboard",

    // How it works
    "edumatch.how.title": "Wie EduMatch Funktioniert",
    "edumatch.how.step1.title": "Frage Stellen",
    "edumatch.how.step1.desc":
      "Foto, Sprachnachricht oder Text hochladen. Unsere KI versteht Kontext und Komplexität.",
    "edumatch.how.step2.title": "KI-Hilfe Erhalten",
    "edumatch.how.step2.desc":
      "Detaillierte Erklärung in Sekunden. Folgefragen sind kostenlos.",
    "edumatch.how.step3.title": "Mit Tutoren Matchen",
    "edumatch.how.step3.desc":
      "Mehr Hilfe nötig? Angebote von geprüften lokalen Tutoren anfordern. Vergleichen und buchen.",

    // For Students
    "edumatch.students.section": "Für Studenten",
    "edumatch.students.title": "Hausaufgabenhilfe, Neu Gedacht",
    "edumatch.students.feature1.title": "KI-Erklärungen",
    "edumatch.students.feature1.desc":
      "Schritt-für-Schritt Erklärungen passend zu deinem Niveau und Fach.",
    "edumatch.students.feature2.title": "Jedes Format",
    "edumatch.students.feature2.desc":
      "Fotos, Sprachnachrichten oder Text hochladen. Wir verarbeiten Bilder, Audio und Dokumente.",
    "edumatch.students.feature3.title": "Experten-Tutoren",
    "edumatch.students.feature3.desc":
      "Geprüfte Tutoren passend zu deinem Standort und Fachbedarf.",
    "edumatch.students.feature4.title": "Sichere Zahlungen",
    "edumatch.students.feature4.desc":
      "Sichere Bezahlung mit Stripe. Zahle nur bei Buchung einer Sitzung.",

    // For Tutors
    "edumatch.tutors.section": "Für Tutoren",
    "edumatch.tutors.title": "Verdienen mit dem, was du Liebst",
    "edumatch.tutors.feature1.title": "Rate Festlegen",
    "edumatch.tutors.feature1.desc":
      "Du bestimmst deinen Stundensatz. Wir fügen eine kleine Plattformgebühr hinzu.",
    "edumatch.tutors.feature2.title": "Flexibler Zeitplan",
    "edumatch.tutors.feature2.desc":
      "Wähle wann du verfügbar bist. Studenten buchen Zeiten, die dir passen.",
    "edumatch.tutors.feature3.title": "Schnelle Auszahlungen",
    "edumatch.tutors.feature3.desc":
      "Geld innerhalb von 48 Stunden nach Sitzungsende auf deinem Konto.",
    "edumatch.tutors.cta": "Heute als Tutor Starten",

    // Stats
    "edumatch.stats.questions": "Beantwortete Fragen",
    "edumatch.stats.tutors": "Geprüfte Tutoren",
    "edumatch.stats.satisfaction": "Studentenzufriedenheit",

    // Final CTA
    "edumatch.cta.title": "Bereit zu Starten?",
    "edumatch.cta.subtitle":
      "Schließe dich tausenden Studenten und Tutoren an.",
    "edumatch.cta.ask": "Frage Stellen",
    "edumatch.cta.tutor": "Tutor Werden",

    // Footer
    "edumatch.footer.tagline":
      "KI-basierte Hausaufgabenhilfe und Tutor-Marktplatz.",
    "edumatch.footer.students": "Studenten",
    "edumatch.footer.tutors": "Tutoren",
    "edumatch.footer.legal": "Rechtliches",
    "edumatch.footer.privacy": "Datenschutz",
    "edumatch.footer.terms": "Bedingungen",
    "edumatch.footer.rights": "Alle Rechte vorbehalten.",

    // Dashboard
    "edumatch.dashboard.welcome": "Willkommen zurück",
    "edumatch.dashboard.inquiries": "Meine Fragen",
    "edumatch.dashboard.askQuestion": "Frage Stellen",
    "edumatch.dashboard.noInquiries": "Noch keine Fragen",
    "edumatch.dashboard.askFirst": "Stelle deine erste Frage",
    "edumatch.dashboard.wallet": "Wallet",
    "edumatch.dashboard.balance": "Verfügbares Guthaben",
    "edumatch.dashboard.pending": "Ausstehend",
    "edumatch.dashboard.requests": "Angebotsanfragen",
    "edumatch.dashboard.actions": "Schnellaktionen",
    "edumatch.dashboard.setupStripe": "Stripe Connect Einrichten",
    "edumatch.dashboard.editProfile": "Profil Bearbeiten",

    // Status badges
    "edumatch.status.NEW": "Neu",
    "edumatch.status.AI_RESPONDED": "KI Antwortete",
    "edumatch.status.TUTOR_REQUESTED": "Tutor Angefragt",
    "edumatch.status.BOOKED": "Gebucht",
    "edumatch.status.CLOSED": "Geschlossen",

    // Student dashboard
    "edumatch.student.signInRequired": "Bitte anmelden",
    "edumatch.student.signIn": "Anmelden",
    "edumatch.student.profileMissing.title":
      "Studentenprofil noch nicht eingerichtet",
    "edumatch.student.profileMissing.desc":
      "Du benötigst ein Studentenprofil, bevor du Anfragen stellen kannst. Es dauert nur wenige Sekunden.",
    "edumatch.student.profileMissing.action": "Profil einrichten",
    "edumatch.student.editProfile": "Profil Bearbeiten",
    "edumatch.student.createProfile": "Profil Erstellen",
    "edumatch.student.noInquiries": "Noch keine Anfragen",

    // New inquiry form
    "edumatch.inquiry.new.title": "Frage Stellen",
    "edumatch.inquiry.new.backToDashboard": "← Zurück zum Dashboard",
    "edumatch.inquiry.new.step.subject": "Fach & Niveau",
    "edumatch.inquiry.new.step.question": "Deine Frage",
    "edumatch.inquiry.new.step.review": "Überprüfung",
    "edumatch.inquiry.new.subject.label": "Fach *",
    "edumatch.inquiry.new.subject.placeholder": "Fach auswählen…",
    "edumatch.inquiry.new.grade.label": "Niveau *",
    "edumatch.inquiry.new.grade.k12": "K–12 (Schule)",
    "edumatch.inquiry.new.grade.undergrad": "Bachelor",
    "edumatch.inquiry.new.grade.grad": "Master / Postgrad",
    "edumatch.inquiry.new.next": "Weiter →",
    "edumatch.inquiry.new.back": "← Zurück",
    "edumatch.inquiry.new.desc.label": "Beschreibe deine Frage *",
    "edumatch.inquiry.new.desc.placeholder":
      "Beschreibe das Problem oder Konzept, bei dem du Hilfe benötigst. Sei so konkret wie möglich — gib Formeln, Kapitelnummern oder anderen hilfreichen Kontext an.",
    "edumatch.inquiry.new.desc.tooShort": "Noch {n} Zeichen erforderlich",
    "edumatch.inquiry.new.desc.ok": "Sieht gut aus ✓",
    "edumatch.inquiry.new.reviewBtn": "Überprüfen →",
    "edumatch.inquiry.new.reviewTitle": "Anfrage überprüfen",
    "edumatch.inquiry.new.reviewSubject": "Fach",
    "edumatch.inquiry.new.reviewGrade": "Niveau",
    "edumatch.inquiry.new.reviewQuestion": "Frage",
    "edumatch.inquiry.new.reviewNote":
      "Nach dem Einreichen erstellt EduMatch AI automatisch eine Erklärung. Danach kannst du Tutor-Angebote anfordern.",
    "edumatch.inquiry.new.editBtn": "← Bearbeiten",
    "edumatch.inquiry.new.submitBtn": "Einreichen & KI-Hilfe Erhalten",
    "edumatch.inquiry.new.submitting": "Wird eingereicht…",
    "edumatch.inquiry.new.change": "Ändern",
    "edumatch.inquiry.new.profile.title":
      "Noch ein Schritt — erstelle dein Studentenprofil",
    "edumatch.inquiry.new.profile.desc":
      "Dein Niveau ist bereits aus deiner Frage übernommen. Wähle optional Fächer aus, die dich interessieren, dann reichen wir deine Anfrage automatisch ein.",
    "edumatch.inquiry.new.profile.grade": "Niveau",
    "edumatch.inquiry.new.profile.subjects": "Interessenfächer",
    "edumatch.inquiry.new.profile.subjectsOptional": "(optional)",
    "edumatch.inquiry.new.profile.createBtn":
      "Profil Erstellen & Anfrage Einreichen",
    "edumatch.inquiry.new.profile.creating":
      "Profil wird erstellt & eingereicht…",
    "edumatch.inquiry.new.networkError":
      "Netzwerkfehler. Bitte erneut versuchen.",

    // Inquiry detail
    "edumatch.inquiry.detail.backToDashboard": "← Dashboard",
    "edumatch.inquiry.detail.aiTitle": "KI-Erklärung",
    "edumatch.inquiry.detail.askAi": "KI Fragen",
    "edumatch.inquiry.detail.askAgain": "Erneut Fragen",
    "edumatch.inquiry.detail.thinking": "Nachdenken…",
    "edumatch.inquiry.detail.generating": "KI-Antwort wird generiert…",
    "edumatch.inquiry.detail.askPrompt":
      'Klicke auf "KI Fragen" für eine Erklärung von EduMatch AI.',
    "edumatch.inquiry.detail.requestTutors": "Tutor-Angebote Anfordern",
    "edumatch.inquiry.detail.requesting": "Wird angefordert…",
    "edumatch.inquiry.detail.viewQuotes": "Angebote Ansehen",
    "edumatch.inquiry.detail.dismiss": "schließen",
    "edumatch.inquiry.detail.aiUnavailable": "KI-Dienst nicht verfügbar.",
    "edumatch.inquiry.detail.streamInterrupted": "Stream unterbrochen.",
    "edumatch.inquiry.detail.locationRequired":
      "Standort erforderlich, um Tutoren in der Nähe zu finden. Bitte lege deinen Heimatstandort in deinem Studentenprofil fest oder erlaube den Browserzugriff auf deinen Standort.",
    "edumatch.inquiry.detail.quoteFailed": "Angebotsanfrage fehlgeschlagen.",
    "edumatch.inquiry.detail.quoteSuccess.title":
      "✅ Anfrage an Tutoren gesendet!",
    "edumatch.inquiry.detail.quoteSuccess.notified":
      "{n} Tutor wurde benachrichtigt und kann jetzt ein Angebot einreichen. Du wirst in einem Moment zur Angebotsseite weitergeleitet…",
    "edumatch.inquiry.detail.quoteSuccess.notifiedPlural":
      "{n} Tutoren wurden benachrichtigt und können jetzt ein Angebot einreichen. Du wirst in einem Moment zur Angebotsseite weitergeleitet…",
    "edumatch.inquiry.detail.quoteSuccess.noTutors":
      "Derzeit sind keine Tutoren in der Nähe verfügbar, aber deine Anfrage wurde gespeichert. Du wirst in einem Moment zur Angebotsseite weitergeleitet…",
    "edumatch.inquiry.detail.moderation.refused":
      "EduMatch AI hat diese Anfrage abgelehnt.",
    "edumatch.inquiry.detail.moderation.category":
      "Kategorie: {category}. Die nachstehende Nachricht erklärt, wobei wir stattdessen helfen können.",

    // Quotes page
    "edumatch.quotes.title": "Tutor-Angebote",
    "edumatch.quotes.subtitle":
      "Prüfe Angebote von verfügbaren Tutoren. Akzeptiere eines, um deine Buchung zu bestätigen.",
    "edumatch.quotes.breadcrumb.inquiry": "Anfrage",
    "edumatch.quotes.justRequested.title": "🎉 Deine Anfrage wurde gesendet!",
    "edumatch.quotes.justRequested.desc":
      "Passende Tutoren wurden benachrichtigt und können jetzt ein Angebot einreichen. Diese Seite zeigt ihre Antworten, sobald sie eintreffen — Angebote werden typischerweise innerhalb weniger Stunden gesendet.",
    "edumatch.quotes.justRequested.dismiss": "Schließen",
    "edumatch.quotes.noQuotes": "Noch keine Angebote.",
    "edumatch.quotes.noQuotesSub":
      "Tutoren wurden benachrichtigt — schau bald wieder vorbei.",
    "edumatch.quotes.ratePerHour": "Tarif / Std.",
    "edumatch.quotes.estHours": "Gesch. Stunden",
    "edumatch.quotes.total": "Gesamt",
    "edumatch.quotes.availableSlots": "Verfügbare Zeitfenster",
    "edumatch.quotes.verified": "✓ Verifiziert",
    "edumatch.quotes.review": "Bewertung",
    "edumatch.quotes.reviews": "Bewertungen",
    "edumatch.quotes.accept": "Akzeptieren & Buchen",
    "edumatch.quotes.booking": "Wird gebucht…",
    "edumatch.quotes.decline": "Ablehnen",
    "edumatch.quotes.bookingConfirmed": "✓ Buchung bestätigt",
    "edumatch.quotes.online": "Online",
    "edumatch.quotes.inPerson": "Persönlich",
    "edumatch.quotes.noRequestFound":
      "Keine Angebotsanfrage gefunden. Bitte gehe zurück und fordere Tutor-Angebote an.",

    // Student profile
    "edumatch.profile.student.title.create": "Studentenprofil Erstellen",
    "edumatch.profile.student.title.edit": "Studentenprofil Bearbeiten",
    "edumatch.profile.student.subtitle.create":
      "Richte dein Studentenprofil ein, um Fragen zu stellen und mit Tutoren zusammengebracht zu werden.",
    "edumatch.profile.student.subtitle.edit":
      "Aktualisiere dein Niveau und deine Interessenfächer.",
    "edumatch.profile.student.backToDashboard": "← Zurück zum Dashboard",
    "edumatch.profile.student.gradeLevel": "Niveau *",
    "edumatch.profile.student.subjects": "Interessenfächer",
    "edumatch.profile.student.subjectsHint":
      "Wähle Fächer aus, die dich interessieren. Das hilft uns, dich mit relevanten Tutoren zusammenzubringen.",
    "edumatch.profile.student.address.title": "Heimadresse (Optional)",
    "edumatch.profile.student.address.street": "Straßenadresse",
    "edumatch.profile.student.address.city": "Stadt",
    "edumatch.profile.student.address.region": "Region / Bundesland",
    "edumatch.profile.student.address.postalCode": "Postleitzahl",
    "edumatch.profile.student.address.country": "Land",
    "edumatch.profile.student.address.hint":
      "Wird verwendet, um dich mit Tutoren in der Nähe zusammenzubringen. Du kannst dies leer lassen und nur Online-Tutoren nutzen.",
    "edumatch.profile.student.cancel": "Abbrechen",
    "edumatch.profile.student.save": "Änderungen Speichern",
    "edumatch.profile.student.create": "Profil Erstellen",
    "edumatch.profile.student.saving": "Wird gespeichert…",
    "edumatch.profile.student.savedOk": "Profil erfolgreich gespeichert!",

    // Tutor dashboard
    "edumatch.tutor.signInRequired": "Bitte anmelden",
    "edumatch.tutor.signIn": "Anmelden",
    "edumatch.tutor.profileMissing.title":
      "Tutorprofil noch nicht eingerichtet",
    "edumatch.tutor.profileMissing.desc":
      "Du benötigst ein Tutorprofil mit deinen Fächern und deinem Stundensatz, bevor du Angebotsanfragen erhalten kannst.",
    "edumatch.tutor.profileMissing.action": "Profil einrichten",
    "edumatch.tutor.stripe.connectTitle": "Bankkonto verbinden",
    "edumatch.tutor.stripe.verifyTitle": "Stripe-Verifizierung abschließen",
    "edumatch.tutor.stripe.connectDesc":
      "Richte Stripe Connect ein, um Zahlungen von Studenten zu empfangen.",
    "edumatch.tutor.stripe.verifyDesc":
      "Dein Konto wurde erstellt, muss aber verifiziert werden, um Auszahlungen zu ermöglichen.",
    "edumatch.tutor.stripe.connectAction": "Stripe Verbinden",
    "edumatch.tutor.stripe.completeAction": "Einrichtung Abschließen",
    "edumatch.tutor.payout.success":
      "Auszahlung erfolgreich angefordert! Geld trifft in 1-2 Werktagen ein.",
    "edumatch.tutor.dashboard.title": "Tutor-Dashboard",
    "edumatch.tutor.dashboard.subtitle":
      "Verwalte deine Einnahmen und Angebotsanfragen",
    "edumatch.tutor.balance.nextPayout": "Nächste Auszahlung verfügbar {date}",
    "edumatch.tutor.balance.pendingNote": "Verfügbar 24h nach der Sitzung",
    "edumatch.tutor.balance.requestPayout": "Auszahlung Anfordern",
    "edumatch.tutor.balance.processing": "Wird verarbeitet...",
    "edumatch.tutor.quoteRequests.label": "Angebotsanfragen",
    "edumatch.tutor.quoteRequests.view": "Anfragen ansehen →",
    "edumatch.tutor.transactions.title": "Aktuelle Transaktionen",
    "edumatch.tutor.transactions.sessionPayment": "Sitzungszahlung",
    "edumatch.tutor.transactions.payout": "Banküberweisung",
    "edumatch.tutor.transactions.fee": "Gebühr:",
    "edumatch.tutor.quickActions.stripeConnected": "Stripe Verbunden ✓",
    "edumatch.tutor.quickActions.setupStripe": "Stripe Connect Einrichten",
    "edumatch.tutor.editProfile": "Profil Bearbeiten",
    "edumatch.tutor.createProfile": "Profil Erstellen",

    // Tutor profile
    "edumatch.profile.tutor.title.create": "Tutorprofil Erstellen",
    "edumatch.profile.tutor.title.edit": "Tutorprofil Bearbeiten",
    "edumatch.profile.tutor.subtitle.create":
      "Richte dein Tutorprofil ein, um Angebotsanfragen von Studenten zu erhalten.",
    "edumatch.profile.tutor.subtitle.edit":
      "Aktualisiere deine Tutordetails und Verfügbarkeit.",
    "edumatch.profile.tutor.backToDashboard": "← Zurück zum Dashboard",
    "edumatch.profile.tutor.bio.label": "Biografie",
    "edumatch.profile.tutor.bio.placeholder":
      "Erzähle Studenten von deiner Unterrichtserfahrung, Qualifikationen und deinem Ansatz...",
    "edumatch.profile.tutor.bio.chars": "{n}/2000 Zeichen",
    "edumatch.profile.tutor.subjects.label": "Fächer die du Unterrichtest *",
    "edumatch.profile.tutor.levels.label": "Niveaus die du Unterrichtest *",
    "edumatch.profile.tutor.rate.label": "Stundensatz (€) *",
    "edumatch.profile.tutor.onlineOnly.label":
      "Nur online (kein Präsenzunterricht)",
    "edumatch.profile.tutor.radius.label": "Serviceradius (km)",
    "edumatch.profile.tutor.radius.hint":
      "Wie weit du bereit bist, für Präsenzsitzungen zu reisen",
    "edumatch.profile.tutor.address.optional": "Standort (Optional)",
    "edumatch.profile.tutor.address.required": "Basisstandort *",
    "edumatch.profile.tutor.address.street": "Straßenadresse",
    "edumatch.profile.tutor.address.city": "Stadt",
    "edumatch.profile.tutor.address.region": "Region / Bundesland",
    "edumatch.profile.tutor.address.postalCode": "Postleitzahl",
    "edumatch.profile.tutor.address.country": "Land",
    "edumatch.profile.tutor.cancel": "Abbrechen",
    "edumatch.profile.tutor.save": "Änderungen Speichern",
    "edumatch.profile.tutor.create": "Profil Erstellen",
    "edumatch.profile.tutor.saving": "Wird gespeichert…",
    "edumatch.profile.tutor.savedOk": "Profil erfolgreich gespeichert!",

    // Tutor requests
    "edumatch.requests.title": "Angebotsanfragen",
    "edumatch.requests.subtitle":
      "Studenten in deiner Nähe, die Hilfe in deinen Fächern suchen.",
    "edumatch.requests.open": "Offen ({n})",
    "edumatch.requests.quoted": "Bereits Angeboten ({n})",
    "edumatch.requests.noOpen":
      "Derzeit keine offenen Anfragen, die deinen Fächern entsprechen.",
    "edumatch.requests.expiresIn": "Läuft in {n}h ab",
    "edumatch.requests.distance": "{n} km entfernt",
    "edumatch.requests.online": "Online",
    "edumatch.requests.submitQuote": "Angebot Einreichen",
    "edumatch.requests.hideForm": "Formular Ausblenden",
    "edumatch.requests.submitting": "Wird eingereicht…",
    "edumatch.requests.rate": "Stundensatz (€)",
    "edumatch.requests.hours": "Gesch. Stunden",
    "edumatch.requests.slots.title": "Verfügbare Zeitfenster",
    "edumatch.requests.slots.add": "+ Zeitfenster Hinzufügen",
    "edumatch.requests.slots.start": "Start",
    "edumatch.requests.slots.end": "Ende",
    "edumatch.requests.slots.mode.online": "Online",
    "edumatch.requests.slots.mode.inPerson": "Persönlich",
    "edumatch.requests.slots.remove": "×",
    "edumatch.requests.notes": "Notizen (optional)",
    "edumatch.requests.noSlotError":
      "Füge mindestens ein Zeitfenster hinzu, bevor du einreichst.",
    "edumatch.requests.networkError": "Netzwerkfehler. Bitte erneut versuchen.",
    "edumatch.requests.addProfile":
      "Füge deine Heimadresse in deinem Tutorprofil hinzu, um Anfragen in der Nähe zu sehen.",
  },
};
