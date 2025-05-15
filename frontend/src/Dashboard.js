import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './globalStyles.css'; 

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/statistics');
        setStats(response.data);
        setError('');
      } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
        setError('Falha ao carregar estatísticas. Tente novamente mais tarde.');
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="container"><p>Carregando estatísticas...</p></div>;
  }

  if (error) {
    return <div className="container error-message"><p>{error}</p></div>;
  }

  if (!stats) {
    return <div className="container"><p>Nenhuma estatística disponível.</p></div>;
  }

  return (
    <div className="dashboard-container">
  <div className="dashboard-content">
      <h2>Dashboard de Estatísticas</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total de Promoções</h3>
          <p>{stats.total_promotions}</p>
        </div>
        <div className="stat-card">
          <h3>Promoções Ativas</h3>
          <p>{stats.active_promotions}</p>
        </div>
        <div className="stat-card">
          <h3>Promoções Expiradas</h3>
          <p>{stats.expired_promotions}</p>
        </div>
        <div className="stat-card">
          <h3>Valor Total de Descontos Oferecidos</h3>
          <p>R$ {stats.total_discount_offered ? stats.total_discount_offered.toFixed(2) : '0.00'}</p>
        </div>
         </div>
      </div>

      <div className="category-stats card">
        <h3>Promoções por Categoria</h3>
        {stats.promotions_by_category && stats.promotions_by_category.length > 0 ? (
          <ul>
            {stats.promotions_by_category.map(categoryStat => (
              <li key={categoryStat._id}>
                {categoryStat._id}: {categoryStat.count}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma promoção categorizada encontrada.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

