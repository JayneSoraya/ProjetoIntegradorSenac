String obterPlaceholderPorCategoria(String? categoria) {
  const urlPadrao =
      'https://res.cloudinary.com/xvmvmfkp/image/upload/v1794623763/alimentos.jpg';

  if (categoria == null || categoria.isEmpty) {
    return urlPadrao;
  }

  final catLower = categoria.toLowerCase().trim();

  if (catLower.contains('hortifruti') ||
      catLower.contains('hortifrúti') ||
      catLower.contains('fruta') ||
      catLower.contains('verdura')) {
    return 'https://res.cloudinary.com/xvmvmfkp/image/upload/v1794620998/hortifuti.webp';
  }
  if (catLower.contains('limpeza') ||
      catLower.contains('higiene') ||
      catLower.contains('detergente')) {
    return 'https://res.cloudinary.com/xvmvmfkp/image/upload/v1794621931/limpeza.jpg';
  }
  if (catLower.contains('bebida') ||
      catLower.contains('refrigerante') ||
      catLower.contains('suco')) {
    return 'https://res.cloudinary.com/xvmvmfkp/image/upload/v1794621293/bebidas.webp';
  }
  if (catLower.contains('snack') ||
      catLower.contains('salgadinho') ||
      catLower.contains('biscoito')) {
    return 'https://res.cloudinary.com/xvmvmfkp/image/upload/v1794622588/snacks.webp';
  }
  if (catLower.contains('laticinio') ||
      catLower.contains('laticínios') ||
      catLower.contains('queijo') ||
      catLower.contains('leite')) {
    return 'https://res.cloudinary.com/xvmvmfkp/image/upload/v1794623027/laticinios.jpg';
  }
  if (catLower.contains('carne') ||
      catLower.contains('acougue') ||
      catLower.contains('açougue') ||
      catLower.contains('frango')) {
    return 'https://res.cloudinary.com/xvmvmfkp/image/upload/v1794623240/carnes.webp';
  }
  if (catLower.contains('padaria') ||
      catLower.contains('pao') ||
      catLower.contains('pão')) {
    return 'https://res.cloudinary.com/xvmvmfkp/image/upload/v1794623425/padaria.webp';
  }

  return urlPadrao;
}
