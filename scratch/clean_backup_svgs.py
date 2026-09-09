import os, re
backup_dir = r"c:\Users\Yashraj Sathe\Downloads\cm\prototypes_backup"
for fn in os.listdir(backup_dir):
    if fn.endswith(".html"):
        fp = os.path.join(backup_dir, fn)
        with open(fp, "r", encoding="utf-8") as f:
            c = f.read()
        if "rider-img" in c:
            c = re.sub(r'<svg[^>]*class="[^"]*rider-img[^"]*"[^>]*>.*?</svg>', '', c, flags=re.DOTALL)
            with open(fp, "w", encoding="utf-8") as f:
                f.write(c)
            print("Cleaned", fn)
