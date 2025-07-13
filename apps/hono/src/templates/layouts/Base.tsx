import type { FC, PropsWithChildren } from "hono/jsx";

export const Base: FC<PropsWithChildren<{ 
	title: string
}>> = ({
	children,
	title,
}) => {
	const [css, mainjs] = ["/public/index.css", "/public/main.js"];
	return (
		<html lang="en">
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>{title}</title>
				<link href={css} rel="stylesheet" />
				<script defer type="module" src={mainjs} />
			</head>
			<body>
        {children}
			</body>
		</html>
	);
};
