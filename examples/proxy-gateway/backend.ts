import type { Request, Response } from 'express';
import express from 'express';

const app = express();

app.get('/products', (req: Request, res: Response) => {
	return res.status(200).json({
		id: 1,
		name: 'Laptop',
	});
});

app.get('/users', (req: Request, res: Response) => {
	return res.status(200).json({
		id: 1,
		name: 'Mike',
	});
});

app.listen(5000, () => {
	console.log('Backend running on port 5000.');
});
