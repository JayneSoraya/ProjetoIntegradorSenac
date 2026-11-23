import os
import requests

# Config do repositório
repo = os.getenv("REPOSITORY", "JayneSoraya/ProjetoIntegradorSenac")
token = os.getenv("GITHUB_TOKEN")

headers = {"Authorization": f"Bearer {token}"} if token else {}
url = f"https://api.github.com/repos/{repo}/languages"

response = requests.get(url, headers=headers)
if response.status_code != 200:
    print(f"Erro ao buscar linguagens: {response.status_code}")
    exit(1)

languages_data = response.json()
total_bytes = sum(languages_data.values())

if total_bytes == 0:
    print("Nenhuma linguagem encontrada.")
    exit(0)

# Papel de cada linguagem no repositório. Linguagens geradas pelo Flutter para
# outras plataformas (Windows, Linux, macOS, iOS) não são tecnologias do produto.
roles = {
    "Dart": "Aplicativo Android (Flutter)",
    "TypeScript": "API Node.js e portal web React",
    "JavaScript": "Configuração de ferramentas",
    "CSS": "Estilos do portal web",
    "HTML": "Páginas e relatórios estáticos",
    "Python": "Scripts de verificação e automação",
    "PowerShell": "Scripts de teste no Android",
    "PLpgSQL": "Migrations do PostgreSQL",
    "Dockerfile": "Imagens dos contêineres",
}
generated = {"C++", "C", "CMake", "Swift", "Kotlin", "Objective-C", "Ruby"}

# Ordena da maior para a menor porcentagem
sorted_langs = sorted(languages_data.items(), key=lambda item: item[1], reverse=True)

rows = []
for lang, bytes_count in sorted_langs:
    percentage = (bytes_count / total_bytes) * 100
    if percentage < 0.5:  # ignora linguagens com menos de 0.5%
        continue
    if lang in generated:
        role = "Arquivos gerados pelo Flutter para outras plataformas"
    else:
        role = roles.get(lang, "Outros arquivos do repositório")
    rows.append(f"| {lang} | {percentage:.1f}% | {role} |")

# Bloco formatado em Markdown
generated_block = (
    "<details>\n"
    "<summary>Composição do repositório por linguagem (atualizada automaticamente)</summary>\n\n"
    "| Linguagem | Participação | Uso no projeto |\n"
    "| --- | ---: | --- |\n"
    + "\n".join(rows)
    + "\n\n</details>"
)

# Lê o README.md atual e substitui a seção entre marcadores ou reconstrói
with open("README.md", "r", encoding="utf-8") as f:
    content = f.read()

# Para facilitar a substituição exata via script
start_tag = "<!--START_LANGS-->"
end_tag = "<!--END_LANGS-->"

if start_tag in content and end_tag in content:
    parts = content.split(start_tag)
    after_start = parts[1].split(end_tag)[1]
    new_content = parts[0] + start_tag + "\n" + generated_block + "\n" + end_tag + after_start
    
    with open("README.md", "w", encoding="utf-8") as f:
        f.write(new_content)
    print("README atualizado com sucesso!")
else:
    print("Tags <!--START_LANGS--> e <!--END_LANGS--> não encontradas no README.md.")