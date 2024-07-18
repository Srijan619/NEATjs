
import fs, { read } from 'fs';
import ts from 'typescript';
import { parseDocument, DomUtils } from 'htmlparser2';
import { default as serialize } from 'dom-serializer';
import { tag } from './NeatNew.js';

console.log(tag)
const mainNeatFile = 'index.Neat';
const mainIndexHtmlFile = 'index.html';

const variableMap: Record<string, string | undefined> = {};
const functionMap: Record<string, Function> = {};

const readFile = (filePath: string, callback: (data: string) => void) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file: ' + filePath, err);
            return;
        }
        callback(data);
    });
}

const readNeatFile = () => {
    readFile(mainNeatFile, (data: string) => {
        scriptToASTTraverse(extractScripts(data));
        // const parsedHtml = parseHtmlWithDynamicValues(extractFragment(data), variableMap)
        // readAndWriteToIndexHtml(parsedHtml);
        getRootEl(extractFragment(data));
    })
}

// Function to read, modify, and write back to the index.html file
const readAndWriteToIndexHtml = (parsedHtml: string) => {
    readFile(mainIndexHtmlFile, (data: string) => {
        const updatedHtml = appendToAppDiv(data, parsedHtml);
        fs.writeFile(mainIndexHtmlFile, updatedHtml, 'utf8', (err) => {
            if (err) {
                console.error(`Error writing to file ${mainIndexHtmlFile}:`, err);
                return;
            }
            console.log(`Successfully updated ${mainIndexHtmlFile}`);
        });
    });
};

// Function to append parsed HTML to <div id="app">
const appendToAppDiv = (indexHtml: string, parsedHtml: string): string => {
    const document = parseDocument(indexHtml);
    const appDiv = DomUtils.findOne(elem => elem.attribs && elem.attribs.id === 'app', document.children);

    if (appDiv) {
        // Clear existing children
        appDiv.children = [];
        // Append new content
        appDiv.children.push(...parseDocument(parsedHtml).children);
    }

    return serialize(document);
};

readNeatFile();
const extractScripts = (string: string) => {
    const scriptRegex = /<script\b[^>]*>(.*?)<\/script>/s;
    const match = string.match(scriptRegex);
    return match ? match[1] : '';
}

const extractFragment = (fragmentString: string) => {
    const fragmentRegex = /<fragment\b[^>]*>(.*?)<\/fragment>/s;
    const match = fragmentString.match(fragmentRegex);
    return match ? match[1] : '';
}

const getRootEl = (html: string) => {
    const root = parseDocument(html, {
        lowerCaseTags: false,
        lowerCaseAttributeNames: false
    });
    if (!root) return;

    root.children.forEach(child => {
        if (child.type === 'tag') {
            const cTag = tag(child.name);
            console.log(cTag)
        }
    })
}

// Function to parse HTML and replace dynamic values with actual data
const parseHtmlWithDynamicValues = (html: string, data: Record<string, any>): string => {
    const root = parseDocument(html, {
        lowerCaseTags: false,
        lowerCaseAttributeNames: false
    });

    const replaceDynamicValues = (node: any) => {
        if (node.type === 'text') {
            node.data = node.data.replace(/{{\s*(\w+)\s*}}/g, (_, key) => {
                return key in data ? data[key] : `{{${key}}}`;
            });
        } else if (node.children && node.children.length) {
            node.children.forEach(replaceDynamicValues);
        }
    };


    root.children.forEach(replaceDynamicValues);
    return serialize(root);
}

function scriptToASTTraverse(script: string) {
    // Source file needs to be provided always to parser
    const sourceFile = ts.createSourceFile("some.ts", script, ts.ScriptTarget.Latest);

    // Function to traverse AST nodes
    function traverse(node: ts.Node) {
        // Check for variable declarations
        // And if it is a variable declaration we need to keep track and make them reactive.
        if (ts.isVariableDeclaration(node)) {
            const name = node.name.getText(sourceFile);
            const initializer = node.initializer?.getText(sourceFile);

            if (initializer && (node.initializer && (ts.isFunctionExpression(node.initializer) || ts.isArrowFunction(node.initializer)))) {
                // Store the function body as a new function in the functionMap
                functionMap[name] = new Function(`return (${initializer})`)();
                console.log(`Arrow Function Name: ${name}, Function Body: ${initializer}`);
            } else {
                // Store the variable name and its initializer in the variableMap
                variableMap[name] = initializer;
                console.log(`Variable Name: ${name}, Initializer: ${initializer}`);
            }
        }

        // Check for function declarations (normal functions that start with function identifier)
        if (ts.isFunctionDeclaration(node) && node.name) {
            const name = node.name.getText(sourceFile);
            const functionBody = node.getText(sourceFile);

            // Store the function body as a new function in the functionMap
            functionMap[name] = new Function(functionBody);
            console.log(`Function Name: ${name}, Function Body: ${functionBody}`);
        }

        // Recursively traverse child nodes
        ts.forEachChild(node, (childNode) => traverse(childNode));
    }

    traverse(sourceFile);

    // Execute functions and store results in variableMap
    for (const [name, func] of Object.entries(functionMap)) {
        console.log("Going throuhg function maps...", name, func())
        //variableMap[name] = func().toString();
        console.log(`Function Result - Name: ${name}, Result: ${variableMap[name]}`);
    }


    // Create a printer and print the AST
    const printer = ts.createPrinter();
    const ast = printer.printNode(ts.EmitHint.Unspecified, sourceFile, sourceFile);

    // Write the AST to a file
    fs.writeFileSync('index.js', ast, 'utf8');

    console.log('AST has been written to index.js');
}