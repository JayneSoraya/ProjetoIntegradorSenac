export function obterPlaceholderPorCategoria(categoria: string | null): string {
  const urlPadrao = 'https://res.cloudinary.com/xvmvmfkp/image/upload/v1794623763/alimentos.jpg';

  if (!categoria) {
    return urlPadrao;
  }

  const catLower = categoria.toLowerCase().trim();

  if (catLower.includes('hortifruti') || catLower.includes('hortifrúti') || catLower.includes('fruta') || catLower.includes('verdura')) {
    return 'https://res.cloudinary.com/xvmvmfkp/image/upload/v1794620998/hortifuti.webp';
  }
  if (catLower.includes('limpeza') || catLower.includes('higiene') || catLower.includes('detergente')) {
    return 'https://res.cloudinary.com/xvmvmfkp/image/upload/v1794621931/limpeza.jpg';
  }
  if (catLower.includes('bebida') || catLower.includes('refrigerante') || catLower.includes('suco')) {
    return 'https://res.cloudinary.com/xvmvmfkp/image/upload/v1794621293/bebidas.webp';
  }
  if (catLower.includes('snack') || catLower.includes('salgadinho') || catLower.includes('biscoito')) {
    return 'https://res.cloudinary.com/xvmvmfkp/image/upload/v1794622588/snacks.webp';
  }
  if (catLower.includes('laticinio') || catLower.includes('laticínios') || catLower.includes('queijo') || catLower.includes('leite')) {
    return 'https://res.cloudinary.com/xvmvmfkp/image/upload/v1794623027/laticinios.jpg';
  }
  if (catLower.includes('carne') || catLower.includes('acougue') || catLower.includes('açougue') || catLower.includes('frango')) {
    return 'https://res.cloudinary.com/xvmvmfkp/image/upload/v1794623240/carnes.webp';
  }
  if (catLower.includes('padaria') || catLower.includes('pao') || catLower.includes('pão')) {
    return 'https://res.cloudinary.com/xvmvmfkp/image/upload/v1794623425/padaria.webp';
  }

  return urlPadrao;
}