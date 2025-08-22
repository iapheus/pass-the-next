import fs from 'fs';
import path from 'path';

function getTodayFilename(): string {
	const today = new Date();
	const yyyy = today.getFullYear();
	const mm = String(today.getMonth() + 1).padStart(2, '0');
	const dd = String(today.getDate()).padStart(2, '0');
	return `${yyyy}-${mm}-${dd}.json`;
}

export function saveLog(data: object) {
	const projectRoot = process.cwd();
	const logsDir = path.join(projectRoot, 'logs');
	const fileName = getTodayFilename();
	const filePath = path.join(logsDir, fileName);

	if (!fs.existsSync(logsDir)) {
		fs.mkdirSync(logsDir, { recursive: true });
	}

	let existingLogs: object[] = [];

	if (fs.existsSync(filePath)) {
		try {
			const content = fs.readFileSync(filePath, 'utf-8');
			existingLogs = JSON.parse(content);
			if (!Array.isArray(existingLogs)) existingLogs = [existingLogs];
		} catch (err) {
			console.error('JSON reading error:', err);
		}
	}

	existingLogs.push(data);

	fs.writeFileSync(filePath, JSON.stringify(existingLogs, null, 2), 'utf-8');
}
