import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Įrašų registras — tarnybinių duomenų lentelė" },
      {
        name: "description",
        content:
          "Tvarkykite tarnybinius įrašus vienoje lentelėje: siuntos, ikiteisminiai numeriai, pareigūnai ir bylų būsena.",
      },
      { property: "og:title", content: "Įrašų registras — tarnybinių duomenų lentelė" },
      {
        property: "og:description",
        content:
          "Tvarkykite tarnybinius įrašus vienoje lentelėje: siuntos, ikiteisminiai numeriai, pareigūnai ir bylų būsena.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Įrašų registras</h1>
        <p className="mt-4 text-muted-foreground">
          Visi tarnybiniai įrašai vienoje lentelėje — siuntos, ikiteisminiai numeriai, pareigūnai ir
          bylų būsena.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link to="/irasai">Atidaryti lentelę</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/auth">Prisijungti</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
