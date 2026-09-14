import unicodedata, re
def normalize_txt(s):
    if not s: return ""
    s=unicodedata.normalize("NFD", s)
    s="".join(c for c in s if unicodedata.category(c)!="Mn")
    return s.lower()

def classificar(nome):
    n=normalize_txt(nome)
    termos_telha = ["telha ", "cumeeira", "rufo ", "calha ", "fibrocimento"]
    if any(t in n for t in termos_telha):
        return "telhas-e-coberturas"
    termos_cal_gesso = [
        "cal hidratada", "cal de pintura", "cal virgem", "cal calcaria",
        "gesso rapido", "gesso de construcao", "gesso comum", "gesso em po",
        "gesso para reboco", "gesso acartonado", " cal ", "saco de cal",
        "cal ch-", "cal ch1", "cal ch2", "cal queimada"
    ]
    for t in termos_cal_gesso:
        if t in n:
            return "cal-e-gesso"
    if "cimento" in n:
        excluidos = ["telha", "tinta", "placa", "vaso", "cola ", "adesivo",
                     "ceramica", "porcelana", "piso ", "revestimento", "esmalte", "cola de cimento", "cimento cola"]
        if not any(ex in n for ex in excluidos):
            return "cimentos"
    return None

tests=["Cimento Votoran 50Kg - 1 Unidade","Cimento Cauê Uso Geral CP2-E 50kg","Telha Fibrocimento 2,44X1,10 6MM Brasilit","Cal Hidratada CH-III 20kg","Gesso em Pó 40kg","Cimento Branco 20kg","Cimento Queimado Cinza 5kg"]
for t in tests:
    print(t, "->", classificar(t))
