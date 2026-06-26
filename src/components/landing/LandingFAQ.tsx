import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "What is the difference between platform courses and live programs?",
    a: "Platform courses are self-paced — you learn on your own schedule with video lessons, exercises, and resources. Live programs are scheduled group classes with a certified instructor via Zoom, where you interact with classmates in real time.",
  },
  {
    q: "Do live programs include platform access?",
    a: "Yes. All live group programs include full access to the Acelingua digital platform with video lessons, exercises, and downloadable resources for your level.",
  },
  {
    q: "Do I need a placement test?",
    a: "We recommend it. The placement test helps us identify your current level so you can enroll in the right program. It's free and takes about 15 minutes.",
  },
  {
    q: "How long do programs last?",
    a: "Program duration varies by level, typically between 3 and 6 months. Each program has a defined start date, schedule, and duration set by the instructor.",
  },
  {
    q: "What happens if a cohort does not reach the minimum number of students?",
    a: "If a group does not meet the minimum enrollment, we will either reschedule the start date or offer you a spot in the next available cohort. You will be notified in advance.",
  },
];

export const LandingFAQ = () => {
  return (
    <section className="py-20 px-6 lg:px-20 bg-card">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-14">
          <Badge className="bg-primary/10 text-primary border-0 mb-4 text-xs font-semibold px-4 py-1.5">
            FAQ
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border border-border rounded-xl px-6 bg-background"
            >
              <AccordionTrigger className="text-left text-foreground font-medium text-sm hover:no-underline py-4">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
