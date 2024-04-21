export function camelcaseToTitlecase(text: string) {
    const textWithSpaces = text.replace(/([A-Z])/g, ' $1');
    const titlecaseText = textWithSpaces.charAt(0).toUpperCase() + textWithSpaces.slice(1);
    return titlecaseText;
}