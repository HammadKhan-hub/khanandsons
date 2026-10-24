import React, { createContext, useContext, useEffect, useState } from 'react';

interface RouterContextType {
  path: string;
  pathname: string;
  search: string;
  navigate: (to: string) => void;
}

const getCurrentPath = () => {
  if (typeof window === 'undefined') return '/';
  return window.location.pathname + window.location.search;
};

const getParts = (fullPath: string) => {
  const [pathname, ...searchParts] = fullPath.split('?');
  const search = searchParts.length > 0 ? '?' + searchParts.join('?') : '';
  return { pathname: pathname || '/', search };
};

const initialParts = getParts(typeof window !== 'undefined' ? getCurrentPath() : '/');

const RouterContext = createContext<RouterContextType>({
  path: typeof window !== 'undefined' ? getCurrentPath() : '/',
  pathname: initialParts.pathname,
  search: initialParts.search,
  navigate: () => {},
});

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [path, setPath] = useState(getCurrentPath());

  useEffect(() => {
    const handlePopState = () => {
      setPath(getCurrentPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    if (to === path) return;
    window.history.pushState({}, '', to);
    setPath(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { pathname, search } = getParts(path);

  return (
    <RouterContext.Provider value={{ path, pathname, search, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => useContext(RouterContext);

export const Link: React.FC<
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
> = ({ to, children, className, onClick, ...rest }) => {
  const { navigate, pathname } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && !to.startsWith('http') && !to.startsWith('mailto:') && !to.startsWith('tel:')) {
      e.preventDefault();
      navigate(to);
    }
  };

  const targetPathname = to.split('?')[0];
  const isActive = pathname === targetPathname || (targetPathname !== '/' && pathname.startsWith(targetPathname));

  return (
    <a
      href={to}
      onClick={handleClick}
      className={className}
      data-active={isActive ? 'true' : 'false'}
      {...rest}
    >
      {children}
    </a>
  );
};
