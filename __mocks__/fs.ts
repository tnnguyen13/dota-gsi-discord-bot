const fs = {
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
    readFileSync: jest.fn(),
    unlinkSync: jest.fn(),
    writeFileSync: jest.fn(),
};

module.exports = fs;