import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsApi } from '../services/api.js';
import { Product } from '../types/index.js';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Building2,
  DollarSign,
  Tag,
  ArrowRight
} from 'lucide-react';

export const ProductCertificationPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const categories = [
    'ALL',
    'Food & Beverages',
    'Steel & Metallurgy',
    'Building Materials',
    'Electrical Accessories',
    'Consumer Goods',
    'Personal Safety Equipment',
    'Electronics / IT Goods',
    'Precious Metals'
  ];

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await productsApi.search({
        q: searchQuery,
        category: selectedCategory
      });
      if (res.success && res.data) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0F2C59] to-[#1E3A8A] text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <FileCheck className="w-4 h-4" />
            <span>Conformity Assessment Navigator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Product-to-Standard Matcher</h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1">
            Match any commercial product to its applicable Indian Standard, licensing scheme, and fee structure.
          </p>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm max-w-md">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search product (e.g. Water bottle, TMT Bar, Helmet, Cement)..."
            className="w-full text-xs text-slate-900 focus:outline-none"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#0F2C59] text-white font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-44 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700">No products matching your search</h3>
          <p className="text-xs text-slate-400 mt-1">Try searching another keyword or select All Categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map(prod => (
            <div
              key={prod.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {prod.category}
                  </span>
                  {prod.isMandatory ? (
                    <span className="text-[10px] font-bold uppercase bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Mandatory ISI</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      Voluntary
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-slate-900 mb-1">{prod.name}</h3>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">{prod.description}</p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Standard:</span>
                    <Link
                      to={`/standards?q=${encodeURIComponent(prod.applicableStandard)}`}
                      className="font-bold text-[#0F2C59] hover:underline"
                    >
                      {prod.applicableStandard}
                    </Link>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Scheme:</span>
                    <span className="font-semibold text-slate-800 uppercase text-[10px]">{prod.scheme.replace(/_/g, ' ')}</span>
                  </div>
                  {prod.estimatedFee && (
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-[11px]">
                      <span className="text-slate-400">Estimated Fee:</span>
                      <span className="font-semibold text-emerald-700">{prod.estimatedFee}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => navigate(`/schemes?std=${encodeURIComponent(prod.applicableStandard)}&prod=${encodeURIComponent(prod.name)}`)}
                  className="w-full bg-[#0F2C59] hover:bg-[#1E40AF] text-white py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <span>Generate Factory Checklist</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
