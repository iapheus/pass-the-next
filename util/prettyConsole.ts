const Colors = {
	Reset: '\x1b[0m',
	BgBlack: '\x1b[40m',
	FgCyan: '\x1b[36m',
	FgYellow: '\x1b[33m',
	FgGreen: '\x1b[32m',
	Bright: '\x1b[1m',
	Dim: '\x1b[2m',
};

export default function prettyConsole(logObj: { [key: string]: any }): void {
	const lines: string[] = [];
	const keys = Object.keys(logObj);

	const maxKeyLength = keys.reduce((max, key) => Math.max(max, key.length), 0);

	keys.forEach((key) => {
		if (key == 'service') return;
		const value = logObj[key];

		const keyFormatted =
			`${Colors.FgGreen}${Colors.Bright}` +
			key.padEnd(maxKeyLength + 2) +
			`${Colors.Reset}`;

		let valueFormatted: string;

		if (typeof value === 'object' && value !== null) {
			valueFormatted = `${Colors.Dim}${JSON.stringify(value, null, 2)}${
				Colors.Reset
			}`;
		} else {
			valueFormatted = `${Colors.FgYellow}${value}${Colors.Reset}`;
		}

		lines.push(`  ${keyFormatted}: ${valueFormatted}`);
	});

	console.log(
		`\n${Colors.Bright}--- ${logObj['service']} ---${Colors.Reset}\n` +
			lines.join('\n') +
			`\n${Colors.Bright}-----------------------------------${Colors.Reset}\n`
	);
}
