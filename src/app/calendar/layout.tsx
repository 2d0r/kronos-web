import PageTransitionEffect from '@/app/page-transition';

const PageTransitionLayout = ({ children }: { children: React.ReactNode }) => {
  return <PageTransitionEffect>{children}</PageTransitionEffect>;
};

export default PageTransitionLayout;