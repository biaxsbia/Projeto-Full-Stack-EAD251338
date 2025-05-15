import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import PromotionList from './PromotionList';
import PromotionDetails from './PromotionDetails';
import AddPromotion from './AddPromotion';
import UpdatePromotion from './UpdatePromotion';
import Dashboard from './Dashboard';
import CategoryManager from './CategoryManager';
import './globalStyles.css';

const App = () => {
  return (
    <Router>
      <div className="container">
        <header className="app-header">
          <h1>Gerenciador de Promoções</h1>
          <nav>
            <Link to="/promotions" className="nav-link">Promoções</Link>
            <Link to="/categories" className="nav-link">Categorias</Link>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<PromotionList />} />
            <Route path="/promotions" element={<PromotionList />} />
            <Route path="/promotions/add" element={<AddPromotion />} />
            <Route path="/promotions/:id" element={<PromotionDetails />} />
            <Route path="/promotions/:id/edit" element={<UpdatePromotion />} />
            <Route path="/categories" element={<CategoryManager />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;

