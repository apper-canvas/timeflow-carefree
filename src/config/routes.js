import Home from '@/components/pages/Home';

export const routes = {
  home: {
    id: 'home',
    label: 'TimeFlow',
    path: '/',
    icon: 'Clock',
    component: Home
  }
};

export const routeArray = Object.values(routes);
export default routes;