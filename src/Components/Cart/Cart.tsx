/** @format */

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import axios from 'axios';
import CartProductTile from '../CartProductTile/CartProductTile';
import { Product } from '../../helpers/interfaces';

import { getDatabase, ref, set } from 'firebase/database';
import firebase from '../../helpers/firebaseConfig';

function Cart() {
	//state fro products from API and their total price
	const [products, setProducts] = React.useState<Product[]>();
	const [totPrice, setTotPrice] = React.useState<number>(0);

	React.useEffect(() => {
		axios
			.get('https://fakestoreapi.com/products?limit=5')
			.then((res) => {
				// console.log('Cart', res.data);
				setProducts(res.data);

				//sum of prices of products used to set state
				const prices = res.data
					.map((item: Product) => item.price)
					.reduce((a: number, b: number) => {
						return a + b;
					});
				setTotPrice(prices);
			})
			.catch((e) => console.log(e));
	}, []);

	//adding content of cart to db
	const placeOrder = () => {
		//fn to sending products to db in ref() is URL
		//IMPORTANT add somehow order number
		function placeOrderInDB(uid: string | null, products: Product[]) {
			const db = getDatabase();
			set(ref(db, 'usersOrders/' + uid), products);
		}
		//getting user id nad callback db writing fn
		const auth = firebase.auth;
		let user = auth.currentUser;
		if (user) {
			const { uid } = user;
			products && placeOrderInDB(uid, products);
		}
	};

	return (
		<>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					flexWrap: 'wrap',
				}}>
				<Typography
					align="center"
					gutterBottom
					variant="h5"
					component="div"
					sx={{ my: '1rem' }}>
					{totPrice === 0
						? 'Your cart is empty'
						: `Total price of products in your cart: ${totPrice} PLN`}
				</Typography>
				<Button
					onClick={placeOrder}
					variant="contained"
					size="small"
					sx={{ m: '1rem', px: '2rem' }}>
					Order
				</Button>
			</Box>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					flexWrap: 'wrap',
				}}>
				{products &&
					products.map((product: Product, idx: number) => (
						<CartProductTile key={idx} product={product} />
					))}
			</Box>
		</>
	);
}

export default Cart;
