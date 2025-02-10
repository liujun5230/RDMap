import {MessageBox} from "element-ui";
import "@/utils/css/fkMessageBox.css";

const FkMessageBox: {
	confirm: (title: string, content_title: string, content_message?: string, options?: any) => Promise<any>
	alert: (title: string, content_title: string, content_message: string) => Promise<any>,
} = {...MessageBox} as {
	confirm: (title: string, content_title: string, content_message?: string, options?: any) => Promise<any>
	alert: (title: string, content_title: string, content_message: string) => Promise<any>,
};

function getTemplate(title: string, message?: string): string {
	return message ? `
		<p>
			<span class="content-title">${title}</span>
			<span class="content-message">${message}</span>
		</p>
	` : `
		<p>
			<span class="content-title">${title}</span>
		</p>
	`;
}

FkMessageBox.confirm = (title, content_title, content_message, options) => {
	return MessageBox.confirm(getTemplate(content_title, content_message), title, {
		dangerouslyUseHTMLString: true,
		closeOnClickModal: false,
		customClass: "fk-message-box",
		type: "warning",
		...options
	});
};

FkMessageBox.alert = (title: string, content_title: string, content_message: string) => {
	return MessageBox.alert(getTemplate(content_title, content_message), title, {
		dangerouslyUseHTMLString: true,
		closeOnClickModal: false,
		type: "info"
	});
};

export default FkMessageBox;
