const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-slate-500 sm:px-6 sm:py-5 lg:px-8">
        © {year}
      </div>
    </footer>
  );
};

export default Footer;
