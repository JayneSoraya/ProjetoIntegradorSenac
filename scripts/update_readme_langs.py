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

# Mapeamento de ícones do Devicon para cada linguagem
icon_mapping = {
    "Dart": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dart/dart-original.svg",
    "TypeScript": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg",
    "C++": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg",
    "CMake": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cmake/cmake-original.svg",
    "CSS": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg",
    "HTML": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg",
    "JavaScript": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg",
    "Python": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg"
}

# Descrições padrão para as principais linguagens
descriptions = {
    "Dart": "Core do Aplicativo Mobile Flutter.",
    "TypeScript": "Lógica do Backend e API Node.js.",
    "C++": "Integração nativa do motor do Flutter.",
    "CMake": "Gerenciamento de compilação nativa.",
    "CSS": "Estilização web.",
    "HTML": "Estruturação de páginas."
}

# Ordena da maior para a menor porcentagem
sorted_langs = sorted(languages_data.items(), key=lambda item: item[1], reverse=True)

new_langs_lines = []
for lang, bytes_count in sorted_langs:
    percentage = (bytes_count / total_bytes) * 100
    if percentage < 0.5:  # ignora linguagens com menos de 0.5%
        continue
    icon_url = icon_mapping.get(lang, "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/code/code-original.svg")
    desc = descriptions.get(lang, "Código fonte do projeto.")
    
    line = f'- <img src="{icon_url}" width="24" height="24" /> **{lang} ({percentage:.1f}%)** — {desc}'
    new_langs_lines.append(line)

# Bloco formatado em Markdown
generated_block = "🛠️ **Linguagens e Base**:\n" + "\n".join(new_langs_lines)

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