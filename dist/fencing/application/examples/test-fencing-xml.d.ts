declare class FencingXmlTester {
    createExampleXml(): string;
    testFencingXmlEndpoint(): Promise<void>;
    testFencingFileEndpoint(): Promise<void>;
    runTests(): Promise<void>;
}
export { FencingXmlTester };
