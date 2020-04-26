import React, { useState, useEffect, useCallback } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';

const Ingredients = () => {
  const [userIngredients, setUserIngredients ] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  // useEffect(() => {
  //   fetch('https://react-hooks-83319.firebaseio.com/ingredients.json').then(
  //     res => res.json()
  //   ).then(responseData => {
  //     const loadedIngredients = [];
  //     for(const key in responseData){
  //       loadedIngredients.push({
  //         id: key,
  //         title: responseData[key].title,
  //         amount: responseData[key].amount
  //       })
  //     }
  //     setUserIngredients(loadedIngredients);
  //   })    
  // },[]);

  useEffect(() => {
    console.log('RENDERING INGREDIENTS', userIngredients);
  }, [userIngredients])

  const filteredIngredientHandler = useCallback(filteredIngredients => {
    setUserIngredients(filteredIngredients);
  },[]);

  const addIngredientHandler = ingredient =>{
    setIsLoading(true);
    fetch('https://react-hooks-83319.firebaseio.com/ingredients.json',{
      method: 'POST',
      body: JSON.stringify(ingredient),
      headers: { 'Content-Type' : 'application/json' }
    }).then( res => {
      setIsLoading(false);
      return res.json();      
    }).then( responseData => {      
      setUserIngredients(prevIngredients => [
        ...prevIngredients, 
        { 
          id: responseData.name, 
          ...ingredient
        }
      ])
    }).catch( err => {

    });
    
  }

  const removeIngredientHandler = id =>{
    setIsLoading(true);
    fetch(`https://react-hooks-83319.firebaseio.com/ingredients/${id}.jon`,{
      method: 'DELETE'      
    }).then(res => {
      setIsLoading(false);
      setUserIngredients(prevIngredients => prevIngredients.filter(ingredient => ingredient.id !== id))
    }).catch( err => {
      setError('Something went wrong!');
    });    
  }

  const clearError = () => {
    setError(null);
    setIsLoading(false);
  }

  // console.log(userIngredients);
  return (
    <div className="App">
      {error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}
      <IngredientForm onAddIngredient={addIngredientHandler} loading={isLoading}/>

      <section>
        <Search onLoadIngredients={filteredIngredientHandler}/>
        {/* Need to add list here! */}
        <IngredientList ingredients={userIngredients} onRemoveItem={removeIngredientHandler}/>
      </section>
    </div>
  );
}

export default Ingredients;
