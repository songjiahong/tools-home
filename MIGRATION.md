# Moving floorplan / deployment-dashboard subdomains to hexagonprofile.com (301)

Redirect map
- `floorplan.hexagonprofile.com/*`            -> `https://www.hexagonprofile.com/floor-plan`
- `deployment-dashboard.hexagonprofile.com/*` -> `https://www.hexagonprofile.com/`
- apex `hexagonprofile.com/*`                 -> `https://www.hexagonprofile.com/*` (if www is canonical)

Route 53 only does DNS, so the old names must resolve to something that answers with a 301.

## Option A – old sites are on Amplify (simplest)
Keep the old Amplify apps. In each app: Hosting -> Rewrites and redirects, replace all rules with:
- floorplan app:  Source `/<*>`  Target `https://www.hexagonprofile.com/floor-plan`  Type `301 (Permanent redirect)`
- dashboard app:  Source `/<*>`  Target `https://www.hexagonprofile.com/`            Type `301 (Permanent redirect)`
No DNS change. Deploy the app so the rule is live.

## Option B – CloudFront + CloudFront Function
1. ACM (region us-east-1): request a cert for floorplan.hexagonprofile.com and
   deployment-dashboard.hexagonprofile.com, validate via DNS ("Create records in Route 53").
2. CloudFront: new distribution, alternate domain names = both subdomains, that cert,
   any placeholder origin (the function answers before the origin is used).
3. CloudFront Function (viewer request), attach to the default behaviour:

```js
function handler(event) {
  var host = event.request.headers.host.value;
  var target = host.indexOf('floorplan.') === 0
    ? 'https://www.hexagonprofile.com/floor-plan'
    : 'https://www.hexagonprofile.com/';
  return {
    statusCode: 301,
    statusDescription: 'Moved Permanently',
    headers: { location: { value: target } }
  };
}
```
4. Route 53: lower the TTL of both records to 60s a day before, then change each to an
   A (and AAAA) Alias record pointing at the CloudFront distribution.
5. Verify: `curl -I https://floorplan.hexagonprofile.com/` shows `301` and the right `location`.

## Order of operations
1. Search Console: add a **Domain** property (DNS TXT record in Route 53) before anything moves.
2. Deploy the new site, check `/floor-plan`, `/zh/floor-plan`, `/sitemap.xml`, `/robots.txt`.
3. Put the 301s live (Option A or B).
4. Search Console: submit `https://www.hexagonprofile.com/sitemap.xml`, inspect `/floor-plan` and request indexing.
5. Make `www` vs apex consistent: one of them 301s to the other (sitemap/canonical use `www`).
6. Update links elsewhere: songfinance.com tool URLs, revitapp, GitHub READMEs.
7. Keep the 301s and subdomain DNS records for at least 12 months. Expect a few weeks of ranking fluctuation.

Note: Search Console "Change of address" does not support subdomain -> path moves; do not use it.
