import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PromotionDetails = () => {
  const { id } = useParams();
  const [promotion, setPromotion] = useState(null);
  const [updatedPromotion, setUpdatedPromotion] = useState({
    nome: '',
    valor: '',
    desconto: '',
    valorComDesconto: '',
    categoria: '',
    validade: ''
  });
  const navigate = useNavigate();

  useEffect(() => {

    axios.get(`http://localhost:5000/promotions/${id}`)
      .then(response => {
        setPromotion(response.data);
        setUpdatedPromotion({
          nome: response.data.nome,
          valor: response.data.valor,
          desconto: response.data.desconto,
          valorComDesconto: response.data.valorComDesconto,
          categoria: response.data.categoria,
          validade: response.data.validade
        });
      })
      .catch(error => {
        console.error("Erro ao buscar detalhes da promoção", error);
      });
  }, [id]);

  const handleDelete = () => {
    if (window.confirm("Você tem certeza que deseja excluir esta promoção?")) {
      axios.delete(`http://localhost:5000/promotions/${id}`)
        .then(() => {
          alert('Promoção excluída com sucesso');
          navigate('/promotions');
        })
        .catch((error) => {
          console.error('Erro ao excluir promoção', error);
          alert('Erro ao excluir promoção. Tente novamente.');
        });
    }
  };

  const handleUpdate = (event) => {
    event.preventDefault();

    if (window.confirm("Você tem certeza que deseja atualizar esta promoção?")) {
      axios.put(`http://localhost:5000/promotions/${id}`, updatedPromotion)
        .then(() => {
          alert('Promoção atualizada com sucesso');
          navigate('/promotions');
        })
        .catch((error) => {
          console.error('Erro ao atualizar promoção', error);
          alert('Erro ao atualizar promoção. Tente novamente.');
        });
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUpdatedPromotion(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  if (!promotion) return <div>Carregando...</div>;

  return (
    <div className="promotion-details-container">
      <h2>Detalhes da Promoção</h2>
      <div className="promotion-details">
        <form onSubmit={handleUpdate}>
          <div>
            <label>Nome:</label>
            <input 
              type="text" 
              name="nome" 
              value={updatedPromotion.nome} 
              onChange={handleChange} 
            />
          </div>
          <div>
            <label>Valor:</label>
            <input 
              type="number" 
              name="valor" 
              value={updatedPromotion.valor} 
              onChange={handleChange} 
            />
          </div>
          <div>
            <label>Desconto:</label>
            <input 
              type="number" 
              name="desconto" 
              value={updatedPromotion.desconto} 
              onChange={handleChange} 
            />
          </div>
          <div>
            <label>Valor com Desconto:</label>
            <input 
              type="number" 
              name="valorComDesconto" 
              value={updatedPromotion.valorComDesconto} 
              onChange={handleChange} 
            />
          </div>
          <div>
            <label>Categoria:</label>
            <input 
              type="text" 
              name="categoria" 
              value={updatedPromotion.categoria} 
              onChange={handleChange} 
            />
          </div>
          <div>
            <label>Validade:</label>
            <input 
              type="date" 
              name="validade" 
              value={updatedPromotion.validade} 
              onChange={handleChange} 
            />
          </div>

          <div className="promotion-actions">
            {/* Botão de Atualizar */}
            <button type="submit" className="update-button">Editar</button>
          </div>
        </form>

        <div className="promotion-actions">
          {/* Botão de Excluir */}
          <button onClick={handleDelete} className="delete-button">Excluir</button>
        </div>
      </div>
    </div>
  );
};

export default PromotionDetails;
