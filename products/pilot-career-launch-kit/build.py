# -*- coding: utf-8 -*-
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, ListFlowable, ListItem, HRFlowable
)
from reportlab.pdfgen import canvas

NAVY = colors.HexColor("#1a2e4a")
ORANGE = colors.HexColor("#c0562e")
GRAY = colors.HexColor("#555555")
LIGHT = colors.HexColor("#f2f2f2")

PAGE_TITLE = "Helicopter Pilot Career Launch Kit"
SITE = "helipadusa.com"

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CoverTitle", fontName="Helvetica-Bold", fontSize=28, leading=34,
                           textColor=NAVY, alignment=TA_CENTER, spaceAfter=10))
styles.add(ParagraphStyle(name="CoverSub", fontName="Helvetica", fontSize=13, leading=18,
                           textColor=GRAY, alignment=TA_CENTER, spaceAfter=24))
styles.add(ParagraphStyle(name="SectionHeader", fontName="Helvetica-Bold", fontSize=16, leading=20,
                           textColor=NAVY, spaceBefore=0, spaceAfter=10))
styles.add(ParagraphStyle(name="SubHeader", fontName="Helvetica-Bold", fontSize=11.5, leading=15,
                           textColor=ORANGE, spaceBefore=12, spaceAfter=4))
styles.add(ParagraphStyle(name="Body", fontName="Helvetica", fontSize=10, leading=14.5,
                           textColor=colors.black, spaceAfter=6))
styles.add(ParagraphStyle(name="TableHeaderWhite", fontName="Helvetica-Bold", fontSize=10, leading=14.5,
                           textColor=colors.white, spaceAfter=0))
styles.add(ParagraphStyle(name="TableBody", fontName="Helvetica", fontSize=10, leading=14.5,
                           textColor=colors.black, spaceAfter=0))

def table_data(rows):
    """Wraps table cells in Paragraphs, using white bold text for the header row (row 0)
    so it's actually readable against the navy header background — a plain TableStyle
    TEXTCOLOR command has no effect once a cell holds a Paragraph, since the Paragraph
    draws its own text color regardless."""
    data = []
    for i, row in enumerate(rows):
        style = styles["TableHeaderWhite"] if i == 0 else styles["TableBody"]
        data.append([Paragraph(c, style) for c in row])
    return data
styles.add(ParagraphStyle(name="MyBullet", fontName="Helvetica", fontSize=10, leading=14,
                           textColor=colors.black, leftIndent=14, spaceAfter=5))
styles.add(ParagraphStyle(name="Check", fontName="Helvetica", fontSize=10, leading=14,
                           textColor=colors.black, leftIndent=4, spaceAfter=6))
styles.add(ParagraphStyle(name="Small", fontName="Helvetica-Oblique", fontSize=8.5, leading=12,
                           textColor=GRAY, spaceAfter=6))
styles.add(ParagraphStyle(name="WhatsInside", fontName="Helvetica", fontSize=10.5, leading=16,
                           textColor=colors.black, leftIndent=10, spaceAfter=4))

def section_header(text):
    return [Paragraph(text.upper(), styles["SectionHeader"]),
            HRFlowable(width="100%", thickness=1.4, color=ORANGE, spaceAfter=12)]

def sub(text):
    return Paragraph(text, styles["SubHeader"])

def body(text):
    return Paragraph(text, styles["Body"])

def check_item(text):
    return Paragraph("&#9744;&nbsp;&nbsp;" + text, styles["Check"])

def bullet_item(text):
    return Paragraph("&#8226;&nbsp;&nbsp;" + text, styles["MyBullet"])

def glossary_pairs(pairs):
    flows = []
    for term, defn in pairs:
        flows.append(Paragraph(f"<b>{term}</b><br/>{defn}", styles["Body"]))
    return flows

# ---------------------------------------------------------------- COVER
def build_cover():
    story = []
    story.append(Spacer(1, 0.6*inch))
    story.append(Paragraph("HELICOPTER PILOT<br/>CAREER LAUNCH KIT", styles["CoverTitle"]))
    story.append(Paragraph(
        "The printable checklists, worksheets, and roadmap for going from zero experience "
        "to your first paid helicopter job.", styles["CoverSub"]))
    story.append(HRFlowable(width="60%", thickness=1, color=ORANGE, hAlign="CENTER", spaceAfter=18))
    story.append(Paragraph("What's Inside:", styles["SubHeader"]))
    items = [
        "The Beginner's Jargon Glossary",
        "Rotorcraft Aerodynamics: Words Every Student Should Know",
        "Why Ground School Might Matter More Than Flight Time",
        "The #1 Reason Most Students Never Finish Their PPL",
        "Your Weekly Training Schedule",
        "The Flight School Interview Checklist",
        "Red Flags When Choosing a Flight School",
        "Financing Questions to Ask Before You Sign",
        "Your Training Cost Worksheet",
        "Checkride Documents Checklist",
        "Airspace Classification Cheat Sheet",
        "The Medical Certificate Decision Guide",
        "Helicopter vs. Airplane: Which Path Is Right for You?",
        "The Zero-to-First-Job Roadmap",
        "Recommended Gear & Study Materials",
        "The First Job Interview Prep Sheet",
    ]
    for it in items:
        story.append(Paragraph("&#8226;&nbsp;&nbsp;" + it, styles["WhatsInside"]))
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph(f"{SITE} &middot; America's #1 Helicopter Resource", styles["Small"]))
    story.append(PageBreak())
    return story

# ---------------------------------------------------------------- ORIGINAL: GLOSSARY
def build_glossary():
    story = section_header("The Beginner's Jargon Glossary")
    story.append(body("Walking into a flight school and not knowing half the words being used is "
                       "normal &mdash; everyone starts here. Keep this page handy for your first few weeks."))
    terms = [
        ("AME", "Aviation Medical Examiner &mdash; the FAA-designated doctor who performs your medical exam."),
        ("Checkride", "The official flight test with an examiner that you must pass to earn a certificate or rating."),
        ("CFI / CFII", "Certified Flight Instructor / Certified Flight Instructor-Instrument &mdash; the ratings that let a pilot teach."),
        ("Currency", "Whether you legally meet recent-experience requirements to exercise a privilege (e.g. carrying passengers, flying at night)."),
        ("Discovery Flight", "A short, low-cost introductory lesson many schools offer so you can try flying before committing to full training."),
        ("DPE", "Designated Pilot Examiner &mdash; an FAA-authorized examiner who conducts checkrides."),
        ("Dual (Time)", "Flight time logged with an instructor on board, as opposed to solo time."),
        ("Endorsement", "A signed, dated note in your logbook from an instructor certifying you're ready for something specific (e.g. solo flight)."),
        ("Ground School", "The classroom/academic portion of training covering regulations, weather, and systems &mdash; separate from flight time."),
        ("Logbook", "The official record of every flight you fly &mdash; hours, routes, endorsements. Required by the FAA and yours to keep for life."),
        ("Part 61 / Part 141", "Two different FAA-approved training structures. Part 61 is flexible and self-paced; Part 141 follows a structured, approved curriculum."),
        ("PIC", "Pilot in Command &mdash; the pilot legally responsible for the flight, regardless of who is at the controls."),
        ("Ramp Check", "An unannounced inspection of a pilot and aircraft by an FAA inspector, checking documents and airworthiness."),
        ("Solo (Time)", "Flight time logged while flying alone, without an instructor on board &mdash; only allowed after specific endorsements."),
        ("Squawk", "Slang for a maintenance issue or discrepancy written up on an aircraft."),
        ("VFR / IFR", "Visual Flight Rules / Instrument Flight Rules &mdash; the two basic sets of rules governing how a flight is conducted."),
        ("Wet Rate / Dry Rate", "An aircraft rental price that includes fuel (wet) or excludes it (dry) &mdash; always confirm which one a school is quoting you."),
    ]
    story += glossary_pairs(terms)
    story.append(PageBreak())
    return story

# ---------------------------------------------------------------- NEW: ROTORCRAFT AERODYNAMICS
def build_aero_glossary():
    story = section_header("Rotorcraft Aerodynamics: Words Every Student Should Know")
    story.append(body(
        "Helicopters fly on principles airplane pilots never have to learn. These are the terms "
        "that trip up nearly every new rotary-wing student &mdash; understanding them early makes "
        "ground school (and your instructor's explanations) click much faster."))
    terms = [
        ("Autorotation", "An emergency (or practiced) maneuver that uses the upward flow of air through the rotor system to keep the blades spinning after an engine failure, allowing a controlled descent and landing without engine power."),
        ("Dissymmetry of Lift", "In forward flight, the advancing rotor blade moves faster through the air than the retreating blade, creating unequal lift across the disc. Blade flapping automatically corrects for this."),
        ("Translational Lift", "The extra, \"free\" lift a helicopter gains once it starts moving forward (roughly 16&ndash;24 knots), as the rotor system moves out of its own disturbed air into smoother air."),
        ("Ground Effect", "Extra lift produced when hovering close to the surface, caused by rotor downwash pushing against the ground below and increasing efficiency."),
        ("Settling with Power (Vortex Ring State)", "A dangerous condition where a helicopter descends into its own rotor downwash, losing lift in a way that simply adding power will not fix. A leading cause of low-altitude accidents &mdash; your instructor will drill avoidance of this specifically."),
        ("Retreating Blade Stall", "At high forward airspeeds, the retreating blade can slow enough relative to the oncoming air to stall &mdash; one of the key factors limiting how fast a helicopter can fly."),
        ("Dynamic Rollover", "A ground-contact hazard where, if a skid or wheel catches the ground during liftoff or landing at a bank angle, the helicopter can roll over even with plenty of engine power available."),
    ]
    story += glossary_pairs(terms)
    story.append(PageBreak())
    return story

# ---------------------------------------------------------------- NEW: GROUND SCHOOL ESSAY
def build_ground_school_essay():
    story = section_header("Why Ground School Might Matter More Than Flight Time")
    story.append(body(
        "Most students obsess over stick-and-rudder skills and treat ground school like a "
        "formality to get through. That's backwards."))
    story.append(body(
        "Your oral exam &mdash; the part before you even get in the aircraft on checkride day &mdash; "
        "tests how well you know the FAR/AIM, not how smoothly you hover. Examiners regularly fail "
        "otherwise excellent pilots on the oral portion alone, because the FARs cover an enormous "
        "amount of ground: airspace, weather minimums, aircraft documents, medical requirements, "
        "currency rules, and far more."))
    story.append(body(
        "Flying well gets you in the door. Knowing the regulations forward and backward is what "
        "actually gets you the certificate. Treat daily FAR/AIM review as seriously as you treat "
        "flight lessons &mdash; not an afterthought squeezed in the week before your checkride."))
    story.append(PageBreak())
    return story

# ---------------------------------------------------------------- NEW: CADENCE ESSAY
def build_cadence_essay():
    story = section_header("The #1 Reason Most Students Never Finish Their PPL")
    story.append(body(
        "It's not money, and it's not aptitude &mdash; it's scheduling."))
    story.append(body(
        "Flying once a week feels manageable, but each lesson mostly re-teaches what you were "
        "starting to grasp the week before, because helicopter-handling skills fade that fast "
        "between sessions. The result: more total lessons, more total cost, and a much higher "
        "chance of losing momentum and quitting before finishing."))
    story.append(body(
        "Students who fly 4&ndash;5 days a week, pairing every flight with ground school study the "
        "same day, finish faster, spend less overall, and are far more likely to actually complete "
        "their certificate. If your schedule allows it at all &mdash; even for a short, intensive "
        "block of a few weeks &mdash; clustering your training beats spreading it thin over many "
        "months."))
    story.append(PageBreak())
    return story

# ---------------------------------------------------------------- NEW: WEEKLY SCHEDULE
def build_weekly_schedule():
    story = section_header("Your Weekly Training Schedule")
    story.append(body(
        "Turn the advice on the previous page into an actual plan. Fill this in at the start of "
        "each week &mdash; even a partial week beats no plan at all."))
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    data = [["", "Flight Lesson", "Ground School", "Self-Study", "Notes"]]
    for d in days:
        data.append([d, "", "", "", ""])
    t = Table(data, colWidths=[0.6*inch, 1.35*inch, 1.35*inch, 1.35*inch, 1.65*inch], rowHeights=0.42*inch)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), NAVY),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 9),
        ("GRID", (0,0), (-1,-1), 0.75, colors.HexColor("#cccccc")),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("ALIGN", (0,0), (0,-1), "CENTER"),
        ("FONTNAME", (0,1), (0,-1), "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, LIGHT]),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))
    story.append(body(
        "Tip: block flight lessons and ground school on the <b>same day</b> whenever your school "
        "allows it &mdash; reviewing what you just flew while it's fresh cements it far better than "
        "studying it two days later."))
    story.append(PageBreak())
    return story

# ---------------------------------------------------------------- ORIGINAL: INTERVIEW CHECKLIST
def build_interview_checklist():
    story = section_header("The Flight School Interview Checklist")
    story.append(body(
        "Most students pick a flight school based on price alone, then get surprised later. Bring "
        "this list to every school you visit or call, and write down the answers side by side so "
        "you can actually compare them."))
    groups = [
        ("Training Structure", [
            "Are you Part 61 (flexible, self-paced) or Part 141 (structured curriculum)?",
            "Are you VA-approved, if I plan to use GI Bill / VA education benefits?",
            "What is your average time from start to Private Pilot Certificate?",
            "Is training done with one dedicated instructor, or will I fly with several?",
        ]),
        ("Fleet &amp; Maintenance", [
            "What aircraft do you train in, and how many do you own/operate?",
            "How old is the fleet, and who performs maintenance &mdash; in-house or outsourced?",
            "What is your aircraft downtime like &mdash; how often are lessons cancelled for maintenance?",
            "Do you carry aircraft insurance that covers student pilots?",
        ]),
        ("Instructors", [
            "How long has my primary instructor been teaching here?",
            "What is your instructor turnover like? (High turnover often means inconsistent training.)",
            "Will the same instructor take me through to checkride, or will I be reassigned?",
        ]),
        ("Cost Transparency", [
            "What is the all-in hourly rate &mdash; aircraft AND instructor, wet (fuel included)?",
            "Is ground school priced separately? How much, and is it self-paced or scheduled?",
            "What is a realistic total cost for a student like me, not just the FAA minimum?",
            "Are there package deals or block-hour discounts?",
        ]),
        ("Logistics", [
            "What does a typical weekly schedule look like for a student flying part-time?",
            "Do you offer housing or know of nearby affordable housing for out-of-town students?",
            "What is your policy on weather cancellations and makeup lessons?",
        ]),
    ]
    for title, qs in groups:
        story.append(sub(title))
        for q in qs:
            story.append(check_item(q))
    story.append(PageBreak())
    return story

# ---------------------------------------------------------------- ORIGINAL: RED FLAGS
def build_red_flags():
    story = section_header("Red Flags When Choosing a Flight School")
    story.append(body(
        "Most flight schools are run honestly. But training is expensive and often paid for up "
        "front, which attracts a few bad actors. These are the warning signs worth walking away "
        "from &mdash; trust your gut if more than one of these shows up at the same school."))
    flags = [
        "Heavy pressure to sign a financing agreement or pay a large lump sum on your very first visit, before you've flown with them.",
        "No written cancellation or refund policy &mdash; or they refuse to put their policy in writing at all.",
        "They won't let you sit in on a lesson, meet your instructor, or see the aircraft before you commit and pay.",
        "They can't (or won't) show proof of aircraft insurance when asked directly.",
        "Reviews consistently mention aircraft down for maintenance for weeks with no communication.",
        "Instructor turnover is high enough that you're told upfront to expect to fly with \"whoever is available\" rather than one dedicated instructor.",
        "The advertised total cost is dramatically lower than every other school you've called &mdash; often a sign of hidden fees added later, not real savings.",
        "They discourage you from talking to current or former students before signing up.",
    ]
    for f in flags:
        story.append(check_item(f))
    story.append(Spacer(1, 6))
    story.append(body(
        "None of these alone is automatically disqualifying &mdash; a small school might legitimately "
        "have simple paperwork. But a school hitting several of these at once is telling you "
        "something. Walk away and find one of the many honest schools instead."))
    story.append(PageBreak())
    return story

# ---------------------------------------------------------------- ORIGINAL: FINANCING
def build_financing():
    story = section_header("Before You Sign: Financing Questions")
    story.append(body(
        "Many students finance training through a loan the school arranges or recommends. That's "
        "not automatically bad &mdash; but it's the single place people get hurt financially in this "
        "industry. Ask every one of these before you sign anything, and get the answers in writing, "
        "not just spoken."))
    story.append(sub("Ask the School"))
    for q in [
        "Who is the actual lender &mdash; a bank, credit union, or a third-party financing company the school partners with?",
        "Is there a commission or kickback the school receives for referring me to this lender?",
        "What is the total amount I will repay, not just the monthly payment &mdash; principal plus all interest?",
        "Is the interest rate fixed or variable, and what happens to my payment if it's variable?",
    ]:
        story.append(check_item(q))
    story.append(sub("Ask the Lender"))
    for q in [
        "What happens to my loan balance if I have to stop training &mdash; medical issue, financial hardship, or the school closes?",
        "Is there a grace period, or does repayment start immediately after funds are disbursed?",
        "Are there prepayment penalties if I pay it off early once I'm working?",
        "What is the realistic total monthly payment compared to realistic entry-level pilot pay &mdash; does the math actually work?",
    ]:
        story.append(check_item(q))
    story.append(Spacer(1, 6))
    story.append(body(
        "<b>A simple rule of thumb:</b> if a school or lender seems rushed or annoyed by these "
        "questions, that itself is useful information. A legitimate lender answers all of this "
        "calmly, because reputable ones get asked constantly."))
    story.append(PageBreak())
    return story

# ---------------------------------------------------------------- ORIGINAL: COST WORKSHEET
def build_cost_worksheet():
    story = section_header("Your Training Cost Worksheet")
    story.append(body(
        f"Fill this in with numbers from schools you're actually considering. For a digital, "
        f"auto-calculating version of this same worksheet, use the free Training Cost Calculator "
        f"at {SITE}/helicopter-training-cost-calculator.html &mdash; this page is the pen-and-paper "
        f"version to fill out during a school visit."))
    rows = [
        ["Item", "Your Number", "Notes"],
        ["Certificate goal (Private / Commercial / CFI)", "", ""],
        ["Total flight hours planned", "", "FAA min: 40 Private / 150 Commercial"],
        ["Aircraft rental rate ($/hr, wet)", "", ""],
        ["Instructor rate ($/hr)", "", ""],
        ["% of hours flown dual (with instructor)", "", ""],
        ["Aircraft cost (hours x rate)", "", ""],
        ["Instructor cost (dual hours x rate)", "", ""],
        ["Ground school + study materials", "", ""],
        ["FAA written test fee", "", ""],
        ["Checkride / examiner fee", "", ""],
        ["Headset, gear, supplies", "", ""],
        ["Housing / travel (if applicable)", "", ""],
        ["TOTAL ESTIMATED COST", "", ""],
    ]
    t = Table(rows, colWidths=[2.6*inch, 1.1*inch, 3.0*inch], rowHeights=0.32*inch)
    style = [
        ("BACKGROUND", (0,0), (-1,0), NAVY),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 8.5),
        ("GRID", (0,0), (-1,-1), 0.75, colors.HexColor("#cccccc")),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("ROWBACKGROUNDS", (0,1), (-1,-2), [colors.white, LIGHT]),
        ("BACKGROUND", (0,-1), (-1,-1), colors.HexColor("#ffe9d9")),
        ("FONTNAME", (0,-1), (0,-1), "Helvetica-Bold"),
    ]
    t.setStyle(TableStyle(style))
    story.append(t)
    story.append(Spacer(1, 8))
    story.append(body(
        "Tip: Get this worksheet filled out for two or three different schools before committing. "
        "The sticker price rarely matches the real total &mdash; weather delays, retakes, and extra "
        "hours beyond the FAA minimum are the most common reasons real costs run higher than quoted."))
    story.append(PageBreak())
    return story

# ---------------------------------------------------------------- NEW: CHECKRIDE DOCUMENTS
def build_checkride_documents():
    story = section_header("Checkride Documents Checklist")
    story.append(body(
        "Showing up to your checkride missing a document is one of the most common &mdash; and most "
        "avoidable &mdash; reasons a test gets delayed or cancelled. Confirm every one of these with "
        "your instructor the week before."))
    story.append(sub("Your Documents"))
    for q in [
        "Government-issued photo ID (driver's license or passport)",
        "Current medical certificate (or BasicMed qualification documents)",
        "Student pilot certificate, if applicable",
        "Logbook with every required endorsement signed and dated",
        "FAA Knowledge Test report showing a passing score",
        "IACRA application confirmation printout",
        "Examiner's fee (cash or check, as specified in advance)",
    ]:
        story.append(check_item(q))
    story.append(sub("Aircraft Documents (“ARROW”)"))
    for q in [
        "Airworthiness certificate",
        "Registration",
        "Radio station license (if flying internationally)",
        "Operating limitations (POH / flight manual)",
        "Weight and balance data, current for the aircraft as equipped",
    ]:
        story.append(check_item(q))
    story.append(PageBreak())
    return story

# ---------------------------------------------------------------- NEW: AIRSPACE CHEAT SHEET
def build_airspace_cheatsheet():
    story = section_header("Airspace Classification Cheat Sheet")
    story.append(body(
        "A simplified quick reference, not a replacement for the AIM or your sectional chart &mdash; "
        "always confirm real requirements for the airspace you're actually flying in."))
    rows = [
        ["Class", "Where", "Do You Need Clearance?"],
        ["A", "18,000 ft MSL up to FL600", "IFR only - no VFR flight permitted"],
        ["B", "Busiest major airports", "Yes - explicit ATC clearance into the airspace"],
        ["C", "Busy towered airports w/ radar", "Two-way radio contact established before entry"],
        ["D", "Airports with an operating tower", "Two-way radio contact established before entry"],
        ["E", "Most other controlled airspace", "No clearance, but VFR cloud/visibility minimums apply"],
        ["G", "Uncontrolled airspace", "No clearance; least restrictive, but has its own minimums"],
    ]
    t = Table(rows, colWidths=[0.6*inch, 2.6*inch, 3.6*inch], rowHeights=0.4*inch)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), NAVY),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 9),
        ("GRID", (0,0), (-1,-1), 0.75, colors.HexColor("#cccccc")),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("ALIGN", (0,0), (0,-1), "CENTER"),
        ("FONTNAME", (0,1), (0,-1), "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, LIGHT]),
    ]))
    story.append(t)
    story.append(PageBreak())
    return story

# ---------------------------------------------------------------- ORIGINAL: MEDICAL GUIDE
def build_medical_guide():
    story = section_header("The Medical Certificate Decision Guide")
    story.append(body(
        f"Find the row that matches your goal. For the full explanation of each option, see the "
        f"companion article at {SITE}/helicopter-pilot-medical-requirements.html."))
    rows = [
        ["If you want to...", "You need...", "The short version"],
        ["Fly a helicopter just for fun, no pay involved",
         "BasicMed (usually)",
         "No traditional FAA medical exam needed if you've held one before. Physician checklist every 4 yrs + free online course every 2 yrs."],
        ["Fly for fun but have never held any FAA medical before",
         "Third-Class Medical",
         "A standard AME exam. Valid 60 months if under 40, 24 months if 40+."],
        ["Get paid to fly — tours, EMS, utility, firefighting, offshore",
         "Second-Class Medical",
         "Covers the large majority of real helicopter jobs. Valid 12 months."],
        ["Fly for a scheduled / airline-style (ATP-level) operation",
         "First-Class Medical",
         "The airline standard. Rare in the helicopter world. Valid 12 months under 40, 6 months 40+."],
    ]
    data = table_data(rows)
    t = Table(data, colWidths=[2.1*inch, 1.3*inch, 3.4*inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), NAVY),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("GRID", (0,0), (-1,-1), 0.75, colors.HexColor("#cccccc")),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, LIGHT]),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))
    story.append(body(
        "<b>The most common myth:</b> that you need the toughest medical (First-Class) to have any "
        "professional helicopter career. Most real helicopter jobs &mdash; including EMS &mdash; only "
        "require a Second-Class medical. Don't let that myth talk you out of starting."))
    story.append(Paragraph(
        "This page is a general reference, not medical or legal advice. Confirm your specific "
        "situation with an Aviation Medical Examiner (AME) before making training decisions.",
        styles["Small"]))
    story.append(PageBreak())
    return story

# ---------------------------------------------------------------- NEW: HELI VS AIRPLANE
def build_heli_vs_airplane():
    story = section_header("Helicopter vs. Airplane: Which Path Is Right for You?")
    story.append(body(
        "Still deciding between fixed-wing and rotary-wing? Here's the short version &mdash; for the "
        f"full breakdown, see {SITE}/helicopter-vs-airplane.html."))
    rows = [
        ["", "Helicopter", "Airplane"],
        ["Typical training cost", "Higher per flight hour", "Generally lower per flight hour"],
        ["Unique capability", "Hover, vertical takeoff/landing, land almost anywhere", "Faster cross-country travel, greater range"],
        ["Common early career jobs", "Tours, EMS, utility, firefighting, offshore", "Flight instruction, cargo, regional airline"],
        ["Weather sensitivity", "Often more sensitive to wind and low visibility", "More established all-weather operations at scale"],
        ["Best fit for someone who...", "Wants precision, versatility, and unconventional missions", "Wants speed, range, and the airline career track"],
    ]
    data = table_data(rows)
    t = Table(data, colWidths=[1.9*inch, 2.4*inch, 2.5*inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), NAVY),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("GRID", (0,0), (-1,-1), 0.75, colors.HexColor("#cccccc")),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("FONTNAME", (0,1), (0,-1), "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, LIGHT]),
    ]))
    story.append(t)
    story.append(PageBreak())
    return story

# ---------------------------------------------------------------- ORIGINAL: ROADMAP
def build_roadmap():
    story = section_header("The Zero-to-First-Job Roadmap")
    rows = [
        ["Stage", "Typical Hours", "What Happens Here"],
        ["1. Private Pilot Certificate", "40 hr FAA min (50–70 typical)",
         "Learn to fly solo, pass your written and checkride. This is where nearly every pilot starts, including future professionals."],
        ["2. Commercial Pilot Certificate", "150 hr total (FAA minimum)",
         "Refine your skills to a professional standard. This is the certificate that lets you legally get paid to fly."],
        ["3. Certified Flight Instructor (CFI)", "~250+ hr total typical",
         "Most low-time commercial pilots become instructors first — not because they want to teach forever, but because it is the fastest, most affordable way to build the hours employers require."],
        ["4. Build Hours as an Instructor", "500–1,500 hr (varies by employer)",
         "You get paid to fly while building time. Entry-level jobs almost always require hours well beyond the Commercial minimum."],
        ["5. First Professional Job", "500–1,500+ hr (varies)",
         "Tour pilot, utility, aerial survey, and similar entry-level roles typically open up in this range. EMS and offshore usually require significantly more."],
    ]
    data = table_data(rows)
    t = Table(data, colWidths=[1.7*inch, 1.4*inch, 3.7*inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), NAVY),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("GRID", (0,0), (-1,-1), 0.75, colors.HexColor("#cccccc")),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, LIGHT]),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))
    story.append(body(
        f"Use the free Training Cost Calculator ({SITE}/helicopter-training-cost-calculator.html) "
        f"to estimate what Stage 1 and Stage 2 will actually cost with your own numbers."))
    story.append(PageBreak())
    return story

# ---------------------------------------------------------------- NEW: RECOMMENDED GEAR
def build_recommended_gear():
    story = section_header("Recommended Gear &amp; Study Materials")
    story.append(Paragraph(
        "&#9888; Replace the placeholder links below with your real Amazon Associates affiliate "
        "links before publishing &mdash; as written, these are plain, non-monetized search links.",
        ParagraphStyle(name="Warn", parent=styles["Body"], textColor=ORANGE, fontName="Helvetica-Bold")))
    story.append(Spacer(1, 6))
    items = [
        ("Current-Year FAR/AIM",
         "The single most-referenced book in your entire training. You will open this constantly, "
         "especially prepping for the oral exam.",
         "https://www.amazon.com/s?k=current+year+FAR+AIM"),
        ("Rotorcraft Flying Handbook (FAA-H-8083-21), printed edition",
         "Free as a PDF from the FAA, but most students find a printed, tabbed copy far easier to "
         "actually study from.",
         "https://www.amazon.com/s?k=rotorcraft+flying+handbook"),
        ("A written-test prep tool",
         "Sporty's Study Buddy, Gleim Private Pilot Test Prep, or Dauntless Aviation's apps are the "
         "three most commonly used.",
         "https://www.amazon.com/s?k=private+pilot+written+test+prep"),
        ("Free flashcards",
         "Anki (free flashcard app, phone and computer) has community-made FAA written-test decks "
         "you can download instantly, at no cost.",
         "https://apps.ankiweb.net/"),
    ]
    for title, desc, link in items:
        story.append(Paragraph(f"<b>{title}</b>", styles["SubHeader"]))
        story.append(body(desc))
        story.append(Paragraph(f'<link href="{link}"><font color="#2f6690">{link}</font></link>', styles["Small"]))
        story.append(Spacer(1, 4))
    story.append(PageBreak())
    return story

# ---------------------------------------------------------------- ORIGINAL: JOB INTERVIEW PREP
def build_job_interview_prep():
    story = section_header("First Job Interview Prep Sheet")
    story.append(body(
        "Questions real helicopter employers commonly ask low-time pilots. Write out your own "
        "answers ahead of time &mdash; even a rough outline beats trying to think of these for the "
        "first time in the interview."))
    story.append(sub("Questions You Should Expect"))
    for q in [
        "Walk me through your flight experience — total time, dual vs. solo, aircraft flown.",
        "What is the most difficult situation you have handled in the aircraft, and how did you handle it?",
        "Describe your personal minimums for weather. When would you say no to a flight?",
        "How do you stay proficient between flights, especially during slow periods?",
        "Why do you want to fly for us specifically, versus another operator?",
        "Are you willing to relocate, and what is your availability (weekends, on-call, etc.)?",
        "Tell me about a time you disagreed with a decision made by a supervisor or fellow pilot.",
    ]:
        story.append(check_item(q))
    story.append(sub("Questions Worth Asking Them"))
    for q in [
        "What does a typical week/schedule look like in this role?",
        "What is the realistic timeline and hour requirement to upgrade or move to a different aircraft?",
        "What safety culture do you have — how are close calls or incidents actually handled?",
        "What does the aircraft maintenance program look like?",
        "Who will I be flying with, and what does initial training/mentoring look like?",
    ]:
        story.append(check_item(q))
    story.append(Spacer(1, 10))
    story.append(sub("Keep Building Your Career With More Free Tools"))
    for q in [
        f"Free FAA Written Test Practice Quiz — {SITE}/helicopter-faa-quiz.html",
        f"Free Training Cost Calculator — {SITE}/helicopter-training-cost-calculator.html",
        f"Helicopter Job Board — {SITE}/helicopter-jobs.html",
        f"Pilots For Hire (list yourself once you're certified) — {SITE}/helicopter-pilots-for-hire.html",
        f"158+ FAA-Listed Flight Schools by State — {SITE}",
    ]:
        story.append(bullet_item(q))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "&copy; 2026 HelipadUSA. This guide is for general educational purposes and is not "
        "official FAA material, legal advice, or medical advice. Always verify current "
        "requirements with the FAA and your chosen flight school.", styles["Small"]))
    return story

# ---------------------------------------------------------------- PAGE DECORATION
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        canvas.Canvas.__init__(self, *args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for i, state in enumerate(self._saved_page_states):
            self.__dict__.update(state)
            self.draw_footer(i + 1, num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_footer(self, page_num, total_pages):
        if page_num == 1:
            return
        self.setFont("Helvetica", 8)
        self.setFillColor(GRAY)
        self.drawCentredString(
            LETTER[0] / 2.0, 0.5 * inch,
            f"{PAGE_TITLE} · {SITE} · Page {page_num - 1}"
        )

def build():
    doc = SimpleDocTemplate(
        "/tmp/Helicopter_Pilot_Career_Launch_Kit_v2.pdf",
        pagesize=LETTER,
        leftMargin=0.85*inch, rightMargin=0.85*inch,
        topMargin=0.85*inch, bottomMargin=0.85*inch,
        title=PAGE_TITLE, author="Peter McNees / HelipadUSA",
    )
    story = []
    story += build_cover()
    story += build_glossary()
    story += build_aero_glossary()
    story += build_ground_school_essay()
    story += build_cadence_essay()
    story += build_weekly_schedule()
    story += build_interview_checklist()
    story += build_red_flags()
    story += build_financing()
    story += build_cost_worksheet()
    story += build_checkride_documents()
    story += build_airspace_cheatsheet()
    story += build_medical_guide()
    story += build_heli_vs_airplane()
    story += build_roadmap()
    story += build_recommended_gear()
    story += build_job_interview_prep()
    doc.build(story, canvasmaker=NumberedCanvas)
    print("done")

if __name__ == "__main__":
    build()
