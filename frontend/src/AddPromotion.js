import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './globalStyles.css';


const AddPromotion = () => {
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [desconto, setDesconto] = useState('');
  const [validade, setValidade] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]); 
  const [availableCategories, setAvailableCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/categories');
        setAvailableCategories(response.data.map(cat => cat.name));
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = (event) => {
    const { value, checked } = event.target;
    setSelectedCategories(prev =>
      checked ? [...prev, value] : prev.filter(cat => cat !== value)
    );
  };

  const handleAddPromotion = async (e) => {
    e.preventDefault();
    if (selectedCategories.length === 0) {
        alert("Por favor, selecione ao menos uma categoria.");
        return;
    }
    try {
      const valorComDesconto = parseFloat(valor) - (parseFloat(valor) * parseFloat(desconto)) / 100;
      await axios.post('http://localhost:5000/promotions', {
        nome,
        valor: parseFloat(valor),
        desconto: parseFloat(desconto),
        validade,
        categories: selectedCategories,
        valorComDesconto,
      });
      navigate('/promotions');
    } catch (error) {
      console.error('Erro ao adicionar promoção:', error);
      alert(`Erro ao adicionar promoção: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div className="container">
      <h2 className="title">Adicionar Promoção</h2>
      <button className="button button-secondary" onClick={() => navigate(-1)}>
  Voltar
</button>
      <form onSubmit={handleAddPromotion}>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do Produto"
          required
        />
        <input
          type="number"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Valor (ex: 29.99)"
          step="0.01"
          required
        />
        <input
          type="number"
          value={desconto}
          onChange={(e) => setDesconto(e.target.value)}
          placeholder="Desconto (%)"
          min="0"
          max="100"
          required
        />
        <input
          type="date"
          value={validade}
          onChange={(e) => setValidade(e.target.value)}
          placeholder="Validade da promoção"
          required
        />
        <div className="categories-container">
          <label>Categorias:</label>
          {availableCategories.length > 0 ? (
            availableCategories.map(categoryName => (
              <div key={categoryName} className="category-checkbox">
                <input
                  type="checkbox"
                  id={categoryName}
                  value={categoryName}
                  checked={selectedCategories.includes(categoryName)}
                  onChange={handleCategoryChange}
                />
                <label htmlFor={categoryName}>{categoryName}</label>
              </div>
            ))
          ) : (
            <p>Carregando categorias... (Ou nenhuma categoria cadastrada. Você pode adicionar categorias através de uma interface de gerenciamento de categorias que podemos criar!)</p>
          )}
        </div>
        <button type="submit">Adicionar Promoção</button>
      </form>
    </div>
  );
};

export default AddPromotion;

