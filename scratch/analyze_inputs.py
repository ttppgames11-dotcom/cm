import glob, re, os, sys
sys.stdout.reconfigure(encoding='utf-8')

for f in sorted(glob.glob('*.html')):
    with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
        html = fp.read()
    
    inputs = re.findall(r'<input[^>]+>', html)
    data_search = re.findall(r'data-search="([^"]+)"', html)
    data_tabs = re.findall(r'data-tabs="([^"]+)"', html)
    
    # Check if inputs have data-search
    search_inputs = [i for i in inputs if 'search' in i or 'शोध' in i or 'शोध' in i]
    
    print(f"{f}: inputs={len(inputs)}, data-search={data_search}, data-tabs={data_tabs}")
    for i in inputs:
        if 'search' in i.lower() or 'placeholder' in i.lower():
            print(f"   -> {i[:80]}")
