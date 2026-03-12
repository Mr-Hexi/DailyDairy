import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="glass border-t border-slate-200 mt-auto">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold text-blue-700 tracking-tight mb-4">
                            <span className="text-3xl">🥛</span> DailyDairy
                        </Link>
                        <p className="text-slate-500 mb-6 max-w-sm">
                            Delivering farm-fresh milk and daily organic dairy essentials straight to your doorstep every morning. Pure, fresh, and hassle-free.
                        </p>
                        <div className="flex gap-4">
                            {/* Dummy Social Icons */}
                            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition-colors">
                                <span className="font-bold">fb</span>
                            </a>
                            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition-colors">
                                <span className="font-bold">ig</span>
                            </a>
                            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition-colors">
                                <span className="font-bold">x</span>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold text-slate-800 mb-4">Quick Links</h4>
                        <ul className="space-y-3">
                            <li><Link to="/" className="text-slate-500 hover:text-blue-600 font-medium transition-colors">Home</Link></li>
                            <li><Link to="/products" className="text-slate-500 hover:text-blue-600 font-medium transition-colors">All Products</Link></li>
                            <li><Link to="/about" className="text-slate-500 hover:text-blue-600 font-medium transition-colors">About Us</Link></li>
                            <li><Link to="/contact" className="text-slate-500 hover:text-blue-600 font-medium transition-colors">Support</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-bold text-slate-800 mb-4">Contact Us</h4>
                        <ul className="space-y-3 text-slate-500 font-medium">
                            <li className="flex items-start gap-2">
                                <span>📍</span>
                                <div>123 Dairy Farm Road, Green Valley, India 400001</div>
                            </li>
                            <li className="flex items-center gap-2">
                                <span>📞</span>
                                <a href="tel:+919876543210" className="hover:text-blue-600 transition-colors">+91 98765 43210</a>
                            </li>
                            <li className="flex items-center gap-2">
                                <span>✉️</span>
                                <a href="mailto:hello@dailydairy.com" className="hover:text-blue-600 transition-colors">hello@dailydairy.com</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 font-medium text-sm">
                        &copy; {new Date().getFullYear()} DailyDairy. All rights reserved.
                    </p>
                    <div className="flex gap-4 text-sm font-medium text-slate-500">
                        <Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
