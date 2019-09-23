import React, { useReducer, useEffect, useCallback, useMemo } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from "../UI/ErrorModal";
import Search from './Search';

const ingredientReducer = (state, action) => {
  switch (action.type) {
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...state, action.ingredient];
    case 'DELETE':
      return state.filter(ing => ing.id !== action.id);
    default: throw new Error('Should not get there!');
  }
};

const httpReducer = (state, action) => {
  switch (action.type) {
    case 'SEND':
      return {
        loading: true,
        error: null
      };
    case 'RESPONSE':
      return {...state, loading: false};
    case 'ERROR':
      return {loading: false, error: action.errorMessage};
    case 'CLEAR':
      return {...state, error: null};
    default: throw new Error('Should not be reached!');
  }
};

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, {loading: false, error: null});
  // const [userIngredients, setUserIngredients] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState(null);

  useEffect(() => {
    console.log('RENDERING INGREDIENTS', userIngredients);
  }, [userIngredients]);

  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    // setUserIngredients(filteredIngredients);
    dispatch({ type: 'SET', ingredients: filteredIngredients });
  }, []);

  const addIngredientHandler = useCallback(ingredient => {
    dispatchHttp({type: 'SEND'});
    fetch('https://react-hooks-update-47a88.firebaseio.com/ingredients.json', {
      method: 'POST',
      body: JSON.stringify(ingredient),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => {
        dispatchHttp({type: 'RESPONSE'});
        return response.json();
      })
      .then(responseData => {
        // setUserIngredients(prevIngredients => [
        //   ...prevIngredients,
        //   { id: responseData.name, ...ingredient }
        // ]);
        dispatch({ type: 'ADD', ingredient: { id: responseData.name, ...ingredient }})
      });
  }, []);

  const removeIngredientHandler = useCallback(ingredientId => {
    dispatchHttp({type: 'SEND'});
    fetch(`https://react-hooks-update-47a88.firebaseio.com/ingredients/${ingredientId}.json`, {
      method: 'DELETE'
    }).then(response => {
      dispatchHttp({type: 'RESPONSE'});
      // setUserIngredients(prevIngredients =>
      //   prevIngredients.filter(ingredient => ingredient.id !== ingredientId)
      // );
      dispatch({ type: 'DELETE', id: ingredientId });
    }).catch(error => {
      dispatchHttp({type: 'ERROR', errorMessage: error.message});
    });
  }, []);

  const clearErrorMessage = useCallback(() => {
    dispatchHttp({type: 'CLEAR'});
    dispatchHttp({type: 'RESPONSE'});
  }, []);

  /**
   * useMemo()
   * Can pass any data for non-rendering and for optimization
   * The second argument is an array as always in hooks, but point to the dependencies
   * which are not optimized
   */

  const ingredientList = useMemo(() => {
    return (
      <IngredientList
        ingredients={userIngredients}
        onRemoveItem={removeIngredientHandler}
      />
    )
  }, [userIngredients, removeIngredientHandler]);

  return (
    <div className="App">
      {httpState.error && <ErrorModal onClose={clearErrorMessage}>{httpState.error}</ErrorModal>}

      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={httpState.loading}
      />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  );
};

export default Ingredients;
