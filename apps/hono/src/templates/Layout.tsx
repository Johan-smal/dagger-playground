import type { FC, PropsWithChildren } from "hono/jsx";

export const Layout: FC<PropsWithChildren<{ title: string }>> = ({
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
				<div id="main" class="container mx-auto px-4">
					{children}
				</div>
			</body>
		</html>
	);
};
