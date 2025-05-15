import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './globalStyles.css';

const UpdatePromotion = () => {
  const { id } = useParams();
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [desconto, setDesconto] = useState('');
  const [validade, setValidade] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [originalPromotion, setOriginalPromotion] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPromotionAndCategories = async () => {
      try {
        const promotionResponse = await axios.get(`http://localhost:5000/promotions/${id}`);
        const promoData = promotionResponse.data;
        setNome(promoData.nome || '');
        setValor(promoData.valor !== undefined ? String(promoData.valor) : '');
        setDesconto(promoData.desconto !== undefined ? String(promoData.desconto) : '');
        setValidade(promoData.validade ? promoData.validade.split('T')[0] : '');
        setSelectedCategories(promoData.categories || []);
        setOriginalPromotion(promoData);

        const categoriesResponse = await axios.get('http://localhost:5000/categories');
        setAvailableCategories(categoriesResponse.data.map(cat => cat.name));
      } catch (error) {
        console.error('Erro ao carregar dados da promoção ou categorias:', error);
        alert('Erro ao carregar dados. Verifique o console para mais detalhes.');
      }
    };

    fetchPromotionAndCategories();
  }, [id]);

  const handleCategoryChange = (event) => {
    const { value, checked } = event.target;
    setSelectedCategories(prev =>
      checked ? [...prev, value] : prev.filter(cat => cat !== value)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedCategories.length === 0) {
        alert("Por favor, selecione ao menos uma categoria.");
        return;
    }
    try {
      const numericValor = parseFloat(valor);
      const numericDesconto = parseFloat(desconto);
      const valorComDesconto = numericValor - (numericValor * numericDesconto) / 100;

      const updatedPromotionData = {
        nome,
        valor: numericValor,
        desconto: numericDesconto,
        validade,
        categories: selectedCategories,
        valorComDesconto,
      };

      await axios.put(`http://localhost:5000/promotions/${id}`, updatedPromotionData);
      alert('Promoção atualizada com sucesso!');
      navigate(`/promotions`);
    } catch (error) {
      console.error('Erro ao atualizar promoção:', error);
      alert(`Erro ao atualizar promoção: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Você tem certeza que deseja excluir esta promoção?")) {
      try {
        await axios.delete(`http://localhost:5000/promotions/${id}`);
        alert('Promoção excluída com sucesso');
        navigate('/promotions');
      } catch (error) {
        console.error('Erro ao excluir promoção:', error);
        alert(`Erro ao excluir promoção: ${error.response?.data?.error || error.message}`);
      }
    }
  };

  if (!originalPromotion) return <div className="container"><p>Carregando...</p></div>;

  return (
    <div className="container update-promotion-container">
      <h2>Editar Promoção</h2>
      <form onSubmit={handleSubmit} className="promotion-form">
        <label htmlFor="nome">Nome do Produto:</label>
        <input
          id="nome"
          type="text"
          name="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do produto"
          required
        />

        <label htmlFor="valor">Valor (R$):</label>
        <input
          id="valor"
          type="number"
          name="valor"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Valor (ex: 29.99)"
          step="0.01"
          required
        />

        <label htmlFor="desconto">Desconto (%):</label>
        <input
          id="desconto"
          type="number"
          name="desconto"
          value={desconto}
          onChange={(e) => setDesconto(e.target.value)}
          placeholder="Desconto (%)"
          min="0"
          max="100"
          required
        />

        <label htmlFor="validade">Validade:</label>
        <input
          id="validade"
          type="date"
          name="validade"
          value={validade}
          onChange={(e) => setValidade(e.target.value)}
          required
        />

        <div className="categories-container">
          <label>Categorias:</label>
          {availableCategories.length > 0 ? (
            availableCategories.map(categoryName => (
              <div key={categoryName} className="category-checkbox">
                <input
                  type="checkbox"
                  id={`category-${categoryName}`}
                  value={categoryName}
                  checked={selectedCategories.includes(categoryName)}
                  onChange={handleCategoryChange}
                />
                <label htmlFor={`category-${categoryName}`}>{categoryName}</label>
              </div>
            ))
          ) : (
            <p>Nenhuma categoria disponível. Adicione categorias primeiro.</p>
          )}
        </div>

        <div className="form-buttons">
          <button type="submit" className="button update-btn">Atualizar Promoção</button>
        </div>
      </form>
      
      <div className="danger-zone">
        <h3>Zona de Perigo</h3>
        <button type="button" onClick={handleDelete} className="button delete-btn">Excluir Promoção</button>
      </div>
    </div>
  );
};

export default UpdatePromotion;

