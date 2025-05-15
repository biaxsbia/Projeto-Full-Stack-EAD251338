import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './globalStyles.css';

const PromotionList = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [minDiscountFilter, setMinDiscountFilter] = useState('');
  const [maxDiscountFilter, setMaxDiscountFilter] = useState('');
  const [validUntilFilter, setValidUntilFilter] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/categories');
        setAvailableCategories(response.data.map(cat => cat.name));
      } catch (error) {
        console.error('Erro ao buscar categorias para filtro:', error);
      }
    };
    fetchCategories();
  }, []);

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search_term', searchTerm);
      if (selectedCategoryFilter) params.append('category', selectedCategoryFilter);
      if (minDiscountFilter) params.append('min_discount', minDiscountFilter);
      if (maxDiscountFilter) params.append('max_discount', maxDiscountFilter);
      if (validUntilFilter) params.append('valid_until', validUntilFilter);

      const response = await axios.get(`http://localhost:5000/promotions?${params.toString()}`);
      setPromotions(response.data);
    } catch (err) {
      console.error('Erro ao buscar promoções:', err);
      setError('Falha ao carregar promoções. Tente novamente mais tarde.');
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategoryFilter, minDiscountFilter, maxDiscountFilter, validUntilFilter]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchPromotions();
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategoryFilter('');
    setMinDiscountFilter('');
    setMaxDiscountFilter('');
    setValidUntilFilter('');
  };

  return (
    <div className="container promotion-list-container">
      <h2>Lista de Promoções</h2>
      <div className="add-button-wrapper">
  <Link to="/promotions/add" className="button add-promotion-button">
    Adicionar Nova Promoção
  </Link>
</div>
      <form onSubmit={handleFilterSubmit} className="filter-form card">
        <h3>Filtrar Promoções</h3>
        <div className="filter-grid">
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={selectedCategoryFilter} onChange={(e) => setSelectedCategoryFilter(e.target.value)}>
            <option value="">Todas as Categorias</option>
            {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <input
            type="number"
            placeholder="Desconto Mín (%)"
            value={minDiscountFilter}
            onChange={(e) => setMinDiscountFilter(e.target.value)}
            min="0"
            max="100"
          />
          <input
            type="number"
            placeholder="Desconto Máx (%)"
            value={maxDiscountFilter}
            onChange={(e) => setMaxDiscountFilter(e.target.value)}
            min="0"
            max="100"
          />
          <div className="valid-until-wrapper">
  <label htmlFor="valid-until">Validade até:</label>
  <input
    id="valid-until"
    type="date"
    value={validUntilFilter}
    onChange={(e) => setValidUntilFilter(e.target.value)}
    max="9999-12-31"
  />
</div>
        </div>
        <div className="filter-actions">
          <button type="submit" className="button">Aplicar Filtros</button>
          <button type="button" className="button button-secondary" onClick={clearFilters}>Limpar Filtros</button>
        </div>
      </form>

      {loading && <p>Carregando promoções...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && (
        <div className="promotion-list">
          {promotions.length > 0 ? (
            promotions.map((promotion) => (
              <div key={promotion._id} className="promotion-item card">
                <h3>{promotion.nome}</h3>
                <p><strong>Valor Original:</strong> R$ {promotion.valor ? promotion.valor.toFixed(2) : 'N/A'}</p>
                <p><strong>Desconto:</strong> {promotion.desconto}%</p>
                <p><strong>Valor com Desconto:</strong> R$ {promotion.valorComDesconto ? promotion.valorComDesconto.toFixed(2) : 'N/A'}</p>
                <p><strong>Validade:</strong> {new Date(promotion.validade).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                {promotion.categories && promotion.categories.length > 0 && (
                  <p><strong>Categorias:</strong> {promotion.categories.join(', ')}</p>
                )}
                <div className="promotion-actions">
                  <Link to={`/promotions/${promotion._id}`} className="button button-secondary">Ver Detalhes</Link>
                  <Link to={`/promotions/${promotion._id}`} className="button button-secondary">Editar</Link>
                </div>
              </div>
            ))
          ) : (
            <p>Nenhuma promoção encontrada com os filtros aplicados.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PromotionList;

