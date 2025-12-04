import type { Request, Response } from 'express';
import express from 'express';
import {
	sqliDetector,
	fuzzerDetector,
	xssDetector,
	slidingRateLimiter,
} from '../../index';

const app = express();

app.use(slidingRateLimiter({ options: { maxRequest: 20 } }));
app.use(sqliDetector());

app.get(
	'/products',
	xssDetector({ options: { scanFor: ['query'] } }),
	(req: Request, res: Response) => {
		return res.status(200).json({
			id: 1,
			name: 'Laptop',
		});
	}
);

app.get(
	'/users',
	fuzzerDetector({ options: { statusCode: [404] } }),
	(req: Request, res: Response) => {
		return res.status(200).json({
			id: 1,
			name: 'Mike',
		});
	}
);

app.listen(5000, () => {
	console.log('Backend running on port 5000.');
});
