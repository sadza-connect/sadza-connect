export function getBusinessSectorCover(categoryName?: string): string {
  const cat = (categoryName || '').toLowerCase();

  if (cat.includes('solar') || cat.includes('energy') || cat.includes('electrical')) {
    return 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80';
  }
  if (cat.includes('agri') || cat.includes('farm') || cat.includes('crop') || cat.includes('seed')) {
    return 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80';
  }
  if (cat.includes('build') || cat.includes('hardware') || cat.includes('cement') || cat.includes('construction') || cat.includes('steel')) {
    return 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=1200&q=80';
  }
  if (cat.includes('furniture') || cat.includes('decor') || cat.includes('interior') || cat.includes('home')) {
    return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80';
  }
  if (cat.includes('auto') || cat.includes('car') || cat.includes('spares') || cat.includes('mechanic') || cat.includes('tyre')) {
    return 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80';
  }
  if (cat.includes('food') || cat.includes('restaurant') || cat.includes('dining') || cat.includes('cater')) {
    return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80';
  }
  if (cat.includes('health') || cat.includes('pharm') || cat.includes('clinic') || cat.includes('medical')) {
    return 'https://images.unsplash.com/photo-1586015555751-63c25a1e285d?auto=format&fit=crop&w=1200&q=80';
  }
  if (cat.includes('hotel') || cat.includes('tourism') || cat.includes('lodge') || cat.includes('safari')) {
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
  }
  if (cat.includes('transport') || cat.includes('haulage') || cat.includes('freight') || cat.includes('logistic')) {
    return 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80';
  }
  if (cat.includes('ict') || cat.includes('tech') || cat.includes('comput') || cat.includes('network') || cat.includes('electronic')) {
    return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80';
  }
  if (cat.includes('wholesale') || cat.includes('grocery') || cat.includes('supermarket') || cat.includes('retail')) {
    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80';
  }

  return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80';
}
