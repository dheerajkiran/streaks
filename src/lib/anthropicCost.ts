type CostReportResult = { amount: string };
type CostReportBucket = { results: CostReportResult[] };
type CostReportResponse = {
  data: CostReportBucket[];
  has_more: boolean;
  next_page?: string;
};

/** Official spend in USD since `startingAt`, via Anthropic's Cost API. Returns null if the
 * admin key isn't configured or the request fails, so callers can show a setup prompt. */
export async function fetchAssistantSpendUsd(startingAt: string): Promise<number | null> {
  const adminApiKey = process.env.ANTHROPIC_ADMIN_API_KEY;
  if (!adminApiKey) return null;

  let total = 0;
  let page: string | undefined;

  try {
    do {
      const params = new URLSearchParams({ starting_at: startingAt });
      if (page) params.set("page", page);

      const res = await fetch(`https://api.anthropic.com/v1/organizations/cost_report?${params.toString()}`, {
        headers: {
          "anthropic-version": "2023-06-01",
          "x-api-key": adminApiKey,
        },
        cache: "no-store",
      });
      if (!res.ok) return null;

      const json = (await res.json()) as CostReportResponse;
      for (const bucket of json.data ?? []) {
        for (const result of bucket.results ?? []) {
          total += Number(result.amount) / 100;
        }
      }
      page = json.has_more ? json.next_page : undefined;
    } while (page);
  } catch {
    return null;
  }

  return total;
}
