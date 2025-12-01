import fs from 'fs';
import path from 'path';
import process from 'process';

function getTodayFilename(): string {
	const today = new Date();
	const yyyy = today.getFullYear();
	const mm = String(today.getMonth() + 1).padStart(2, '0');
	const dd = String(today.getDate()).padStart(2, '0');
	return `${yyyy}-${mm}-${dd}.json`;
}

export function saveLog(data: object, dest?: string): boolean {
	const projectRoot = path.dirname(process.cwd());
	const fileName = getTodayFilename();
	let logsDir = path.join(dest || projectRoot, 'logs');
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
			console.error(`Error reading or parsing log file ${filePath}:`, err);
			return false;
		}
	}

	existingLogs.push(data);

	try {
		fs.writeFileSync(filePath, JSON.stringify(existingLogs, null, 2), 'utf-8');
		return true;
	} catch (err) {
		console.error(`Error writing to log file ${filePath}:`, err);
		return false;
	}
}

export function readPreferences(
	fileName: string,
	dest?: string
): { success: boolean; data?: object } {
	const projectRoot = path.dirname(process.cwd());
	const prefsDir = path.join(dest || projectRoot, 'preferences');
	const filePath = path.join(dest || prefsDir, `${fileName}.json`);

	if (fs.existsSync(filePath)) {
		try {
			let content = fs.readFileSync(filePath, 'utf-8');
			return { success: true, data: JSON.parse(content) };
		} catch (error) {
			console.error(
				`Error reading or parsing preference file ${filePath}:`,
				error
			);
			return { success: false };
		}
	} else return { success: false };
}
