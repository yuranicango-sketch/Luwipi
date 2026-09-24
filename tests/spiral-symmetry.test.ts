import test from "node:test";
import assert from "node:assert/strict";
import { spiralMilestones } from "../lib/spiral-curriculum";
import { competencyLabels, type AgeBand, type CompetencyId } from "../lib/suzuki-lessons";

test("all competencies intentionally exist across all three age bands", () => {
  const ages: AgeBand[] = ["2-3","4-5","6-8"];
  for (const competency of Object.keys(competencyLabels) as CompetencyId[]) {
    for (const age of ages) {
      assert.ok(
        spiralMilestones.some((item) => item.competency === competency && item.ageBand === age),
        competency + " missing spiral milestone for " + age,
      );
    }
  }
});

test("reading remains preparatory before the formal 6-8 stage", () => {
  const early = spiralMilestones.find((item) => item.competency === "reading" && item.ageBand === "2-3");
  const middle = spiralMilestones.find((item) => item.competency === "reading" && item.ageBand === "4-5");
  const older = spiralMilestones.find((item) => item.competency === "reading" && item.ageBand === "6-8");
  assert.match(early?.title ?? "", /Som antes de símbolo/i);
  assert.match(middle?.title ?? "", /Símbolos depois da experiência/i);
  assert.match(older?.title ?? "", /Lê por referência/i);
});
