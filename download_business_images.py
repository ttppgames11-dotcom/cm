import urllib.request
import json
import os

queries = [
    ("sangam-ch-pune.jpg", "indian corporate meeting conference"),
    ("sangam-ch-kolhapur.jpg", "indian business handshake partnership"),
    ("sangam-ch-nashik.jpg", "business entrepreneurs discussion table india"),
    ("sangam-ch-csmb.jpg", "corporate office presentation team india"),
    ("sangam-ch-thane.jpg", "mumbai business corporate skyline office")
]

dest_dirs = [
    r"c:\Users\Shasa\Desktop\cm\public\assets\images",
    r"c:\Users\Shasa\Desktop\cm\frontend\public\assets\images"
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for filename, query in queries:
    url = f"https://unsplash.com/napi/search/photos?query={urllib.parse.quote(query)}&per_page=5"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            results = data.get('results', [])
            if results:
                img_url = results[0]['urls']['regular']
                print(f"Downloading {filename} for query '{query}': {img_url}")
                img_req = urllib.request.Request(img_url, headers=headers)
                img_data = urllib.request.urlopen(img_req).read()
                for d in dest_dirs:
                    target_path = os.path.join(d, filename)
                    with open(target_path, 'wb') as f:
                        f.write(img_data)
                print(f"Successfully saved {filename}")
            else:
                print(f"No results for {query}")
    except Exception as e:
        print(f"Error for {query}: {e}")
