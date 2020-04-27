import React, { useReducer, useEffect, useCallback, useMemo } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';
import useHttp from '../../hooks/http';

const ingredientReducer = (currentIngredients, action) => {
  switch(action.type){
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient];      
    case 'DELETE':
      return currentIngredients.filter(ing => ing.id !== action.id);
    default:
      throw new Error('Should not get there!');
  }
}

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const { isLoading, error, data, sendRequest, reqExtra, reqIdentifer} = useHttp();
  // const [userIngredients, setUserIngredients ] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState();

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
    console.log(reqIdentifer);
    if(!isLoading && reqIdentifer === 'REMOVE_INGREDIENT'){
      dispatch({type: "DELETE", id: reqExtra });
    } else if(!isLoading && reqIdentifer === 'ADD_INGREDIENT'){
      dispatch({type: 'ADD', ingredient:  { 
        id: data.name, 
        ...reqExtra
      }}); 
    }    
    // console.log('RENDERING INGREDIENTS', userIngredients);    
  }, [data, reqExtra, reqIdentifer, isLoading])

  const filteredIngredientHandler = useCallback(filteredIngredients => {
    dispatch({type: 'SET', ingredients: filteredIngredients});
  },[]);

  const addIngredientHandler = useCallback(ingredient =>{
    // console.log(ingredient);
    sendRequest(
      `https://react-hooks-83319.firebaseio.com/ingredients.json`, 
      'POST',
      JSON.stringify(ingredient),
      ingredient,
      'ADD_INGREDIENT'    
    );
    // dispatchHttp({type: 'SEND'});    
    // fetch('https://react-hooks-83319.firebaseio.com/ingredients.json',{
    //   method: 'POST',
    //   body: JSON.stringify(ingredient),
    //   headers: { 'Content-Type' : 'application/json' }
    // }).then( res => {
    //   dispatchHttp({type: 'RESPONSE'});
    //   return res.json();      
    // }).then( responseData => {   
    //   dispatch({type: 'ADD', ingredient:  { 
    //     id: responseData.name, 
    //     ...ingredient
    //   }});         
    // }).catch( err => {
    //   dispatchHttp({type: 'ERROR', errorMessage: 'Something went wrong!'});
    // });
    
  }, [sendRequest]);

  const removeIngredientHandler = useCallback(id =>{
    // dispatchHttp({type: 'SEND'});
    sendRequest(
      `https://react-hooks-83319.firebaseio.com/ingredients/${id}.json`, 
      'DELETE',
      null,
      id,
      'REMOVE_INGREDIENT'
    );
  },[sendRequest]);

  const clearError = useCallback(() => {
    // dispatchHttp({type: 'CLEAR'});
  }, []);

  const ingredientList = useMemo(() => {
    return (
      <IngredientList ingredients={userIngredients} onRemoveItem={removeIngredientHandler}/>
    )
  },[userIngredients, removeIngredientHandler]);

  // console.log(userIngredients);
  return (
    <div className="App">
      {error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}
      <IngredientForm onAddIngredient={addIngredientHandler} loading={isLoading}/>
      <section>
        <Search onLoadIngredients={filteredIngredientHandler}/>
        {/* Need to add list here! */}
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;
