#!/bin/bash
# Search images for all products and save results
declare -A PRODUCTS
PRODUCTS=(
  ["cmqvr84qz000bpauzbh2nikh2"]="Fortune Mustard Oil 1 litre bottle product"
  ["cmqvr84r0000dpauzjo0sftay"]="Fortune Soyabean Oil 1 litre bottle product"
  ["cmqvr84r2000fpauzqm3dsi61"]="Saffola Gold cooking oil bottle product"
  ["cmqvr84r3000hpauzn4cqnzf5"]="Dhara Mustard Oil 1 litre bottle product"
  ["cmqvr84r4000jpauzak472v84"]="India Gate Basmati Rice 5kg bag product"
  ["cmqvr84r5000lpauz9830nm1n"]="Daawat Rozana Basmati Rice 5kg bag product"
  ["cmqvr84r6000npauzs74jm9gp"]="Royal Pusa Basmati Rice 5kg bag product"
  ["cmqvr84r7000ppauzho6o6d2h"]="MDH Garam Masala 100g packet product"
  ["cmqvr84r8000rpauzex5vmr60"]="Everest Turmeric Powder 100g packet product"
  ["cmqvr84r9000tpauzj4uxdhec"]="MDH Red Chilli Powder 100g packet product"
  ["cmqvr84ra000vpauzcrwli7k8"]="Aashirvaad Atta 5kg wheat flour bag product"
  ["cmqvr84rb000xpauzfs5ckr0i"]="Fortune Chakki Fresh Atta 5kg bag product"
  ["cmqvr84rc000zpauzv13u0nyz"]="Tata Masoor Dal 1kg packet product"
  ["cmqvr84rd0011pauzxpeorfvb"]="Tata Moong Dal 1kg packet product"
  ["cmqvr84re0013pauzhziax6n3"]="Rajdhani Toor Dal 1kg packet product"
  ["cmqvr84rf0015pauzyq36ci93"]="Madhur Sugar 1kg packet product"
  ["cmqvr84rh0017pauz1j2pbrww"]="Tata Salt 1kg packet product"
  ["cmqvr84ri0019pauzx2nzu6th"]="Haldiram Aloo Bhujia 200g packet product"
  ["cmqvr84rj001bpauz5d3aqe3q"]="Bikaji Moong Dal 200g packet namkeen product"
  ["cmqvr84rk001dpauzb2d1d7jf"]="Surf Excel Easy Wash detergent powder 1kg product"
  ["cmqvr84rk001fpauzr5zjy1k0"]="Vim Dishwash Bar product"
)

OUTFILE="/home/z/my-project/scripts/image-results.json"
echo "{" > "$OUTFILE"
FIRST=true

for id in "${!PRODUCTS[@]}"; do
  query="${PRODUCTS[$id]}"
  echo "Searching: $query ..."
  
  result=$(z-ai image-search -q "$query" -c 1 --no-rank --gl in --output /tmp/img-$id.json 2>/dev/null)
  
  url=$(node -e "
    const d = require('/tmp/img-$id.json');
    if(d.success && d.results.length > 0) console.log(d.results[0].original_url);
    else console.log('');
  " 2>/dev/null)
  
  if [ -n "$url" ]; then
    if [ "$FIRST" = true ]; then FIRST=false; else echo "," >> "$OUTFILE"; fi
    echo "\"$id\":\"$url\"" >> "$OUTFILE"
    echo "  Found: $url"
  else
    echo "  Not found, retrying with shorter query..."
    short_query=$(echo "$query" | sed 's/ [0-9]*[a-z]*g.*//;s/ [0-9]* litre.*//;s/ 1 litre.*//;s/ 5kg.*//;s/ 100g.*//;s/ 200g.*//')
    result=$(z-ai image-search -q "$short_query product" -c 1 --no-rank --gl in --output /tmp/img-$id.json 2>/dev/null)
    url=$(node -e "
      const d = require('/tmp/img-$id.json');
      if(d.success && d.results.length > 0) console.log(d.results[0].original_url);
      else console.log('');
    " 2>/dev/null)
    
    if [ -n "$url" ]; then
      if [ "$FIRST" = true ]; then FIRST=false; else echo "," >> "$OUTFILE"; fi
      echo "\"$id\":\"$url\"" >> "$OUTFILE"
      echo "  Found: $url"
    else
      echo "  FAILED for $id"
    fi
  fi
done

echo "}" >> "$OUTFILE"
echo ""
echo "Done! Results saved to $OUTFILE"