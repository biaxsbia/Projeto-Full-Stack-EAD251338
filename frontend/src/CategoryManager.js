import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './globalStyles.css';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  const apiBaseUrl = 'http://localhost:5000';

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/categories`);
      setCategories(response.data || []);
      setError('');
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
      setError('Falha ao carregar categorias. Tente novamente mais tarde.');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      alert('O nome da categoria não pode ser vazio.');
      return;
    }
    try {
      const response = await axios.post(`${apiBaseUrl}/categories`, { name: newCategoryName.trim() });
      fetchCategories();
      setNewCategoryName('');
      setShowAddForm(false);
      alert(response.data.message || 'Categoria adicionada com sucesso!');
    } catch (err) {
      console.error('Erro ao adicionar categoria:', err);
      alert(`Erro ao adicionar categoria: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (window.confirm(`Tem certeza que deseja excluir a categoria "${categoryName}"? Isso também a removerá de todas as promoções associadas.`)) {
      try {
        await axios.delete(`${apiBaseUrl}/categories/${categoryId}`);
        setCategories(categories.filter(cat => cat._id !== categoryId));
        alert('Categoria excluída com sucesso!');
      } catch (err) {
        console.error('Erro ao excluir categoria:', err);
        alert(`Erro ao excluir categoria: ${err.response?.data?.error || err.message}`);
      }
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory || !editCategoryName.trim()) {
      alert('O nome da categoria não pode ser vazio.');
      return;
    }
    try {
      const response = await axios.put(`${apiBaseUrl}/categories/${editingCategory._id}`, { name: editCategoryName.trim() });
      fetchCategories();
      setEditingCategory(null);
      setEditCategoryName('');
      alert(response.data.message || 'Categoria atualizada com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar categoria:', err);
      alert(`Erro ao atualizar categoria: ${err.response?.data?.error || err.message}`);
    }
  };

  if (loading) {
    return <div className="container"><p>Carregando categorias...</p></div>;
  }

  if (error) {
    return <div className="container error-message"><p>{error}</p></div>;
  }

  return (
    <div className="category-manager-container">
  <div className="category-manager-content">
      <h2>Gerenciar Categorias</h2>

      {!editingCategory && (
        <button onClick={() => setShowAddForm(!showAddForm)} className="button add-category-button">
          {showAddForm ? 'Cancelar Adição' : 'Adicionar Nova Categoria'}
        </button>
      )}

      {showAddForm && !editingCategory && (
        <form onSubmit={handleAddCategory} className="category-form card">
          <h3>Nova Categoria</h3>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nome da nova categoria"
            required
          />
          <button type="submit" className="button">Salvar Categoria</button>
        </form>
      )}

      {editingCategory && (
        <form onSubmit={handleUpdateCategory} className="category-form card">
          <h3>Editando Categoria: {editingCategory.name}</h3>
          <input
            type="text"
            value={editCategoryName}
            onChange={(e) => setEditCategoryName(e.target.value)}
            placeholder="Novo nome da categoria"
            required
          />
          <div className="form-buttons">
            <button type="submit" className="button">Atualizar Categoria</button>
            <button type="button" onClick={() => setEditingCategory(null)} className="button button-secondary">Cancelar Edição</button>
          </div>
        </form>
      )}

      {categories.length > 0 ? (
        <table className="categories-table">
          <thead>
            <tr>
              <th>Nome da Categoria</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category._id}>
                <td>{category.name}</td>
                <td>
                  <button onClick={() => handleEditCategory(category)} className="button button-small button-secondary">Editar</button>
                  <button onClick={() => handleDeleteCategory(category._id, category.name)} className="button button-small delete-btn">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p>Nenhuma categoria cadastrada ainda.</p>
      )}
    </div>
    </div>
  );
};

export default CategoryManager;

