var Montage = require("montage").Montage;
var AbstractImage = require("montage/ui/base/abstract-image").AbstractImage;
var MockDOM = require("mocks/dom");

AbstractImage.prototype.hasTemplate = false;

var src1 = "data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

describe("test/base/abstract-image-spec", function () {
    describe("creation", function () {
        it("cannot be instantiated directly", function () {
            expect(function () {
                new AbstractImage();
            }).toThrow();
        });

        it("can be instantiated as a subtype", function () {
            var ImageSubtype = AbstractImage.specialize( {});
            var anImageSubtype;
            expect(function () {
                anImageSubtype = new ImageSubtype();
            }).not.toThrow();
            expect(anImageSubtype).toBeDefined();
        });
    });

    describe("properties", function () {
        var Image = AbstractImage.specialize( {}),
            anImage;

        beforeEach(function () {
            anImage = new Image();
            anImage.element = MockDOM.element();
        });

        describe("src", function () {
            beforeEach(function () {
                anImage = new Image();
                anImage.element = MockDOM.element();
            });

            it("should start loading the new image", function() {
                anImage.src = src1;

                expect(anImage._isLoadingImage).toBeTruthy();
                expect(anImage._image.src).toBe(src1);
            });
        });
    });

    describe("draw", function () {
        var Image = AbstractImage.specialize( {}),
            anImage;

        beforeEach(function () {
            anImage = new Image();
            anImage.element = MockDOM.element();
            anImage.needsDraw = false;
        });

        it("should be requested after src is changed", function () {
            anImage.src = src1;
            expect(anImage.needsDraw).toBeTruthy();
        });

        it("should be requested after src is set to a falsy value", function () {
            anImage.src = "";
            expect(anImage.needsDraw).toBeTruthy();
        });

        it("should be requested after crossOrigin is changed", function () {
            anImage.crossOrigin = "";
            expect(anImage.needsDraw).toBeTruthy();
        });

        it("should draw the empty image when src is changed and hasn't been loaded yet", function () {
            anImage.src = src1;
            anImage.draw();
            expect(anImage.element.src).toBe(anImage.emptyImageSrc);
        });

        it("should draw the image when src is changed and it has been loaded", function () {
            anImage.src = src1;
            anImage._isLoadingImage = false;
            anImage.draw();
            expect(anImage.element.src).toBe(src1);
        });

        it("should draw the empty image when src is set to a falsy value", function () {
            anImage.src = null;
            anImage._isLoadingImage = false;
            anImage.draw();
            expect(anImage.element.src).toBe(anImage.emptyImageSrc);
        });

        it("should change the crossorigin attribute when crossOrigin is set", function () {
            anImage.src = "http://montagejs.org/images/logo-montage.png";
            anImage.crossOrigin = "anonymous";
            anImage._isLoadingImage = false;
            anImage.draw();
            expect(anImage.element.getAttribute("crossorigin")).toBe("anonymous");
        });

        it("should remove the crossorigin attribute when crossOrigin is null", function () {
            anImage.element.setAttribute("crossorigin", "anonymous");
            anImage.src = "http://montagejs.org/images/logo-montage.png";
            anImage.crossOrigin = null;
            anImage._isLoadingImage = false;
            anImage.draw();
            expect(anImage.element.hasAttribute("crossorigin")).toBe(false);
        });

        it("should remove the crossorigin attribute when src is using the data: protocol", function () {
            anImage.src = src1;
            anImage.crossOrigin = "anonymous";
            anImage._isLoadingImage = false;
            anImage.draw();
            expect(anImage.element.hasAttribute("crossorigin")).toBe(false);
        });
    });

    describe("rebased src", function() {
        var Image = AbstractImage.specialize( {}),
            anImage;

        beforeEach(function () {
            anImage = new Image();
        });

        it("should not rebase http:// urls", function() {
            var src = "http://montagejs.org/images/logo-montage.png",
                rebasedSrc;

            anImage.src = src;
            rebasedSrc = anImage._getRebasedSrc();

            expect(rebasedSrc).toBe(src);
        });

        it("should not rebase https:// urls", function() {
            var src = "https://montagejs.org/images/logo-montage.png",
                rebasedSrc;

            anImage.src = src;
            rebasedSrc = anImage._getRebasedSrc();

            expect(rebasedSrc).toBe(src);
        });

        it("should not rebase / urls", function() {
            var src = "/montagejs.org/images/logo-montage.png",
                rebasedSrc;

            anImage.src = src;
            rebasedSrc = anImage._getRebasedSrc();

            expect(rebasedSrc).toBe(src);
        });

        it("should not rebase // urls", function() {
            var src = "//montagejs.org/images/logo-montage.png",
                rebasedSrc;

            anImage.src = src;
            rebasedSrc = anImage._getRebasedSrc();

            expect(rebasedSrc).toBe(src);
        });

        it("should not rebase data: urls", function() {
            var src = src1,
                rebasedSrc;

            anImage.src = src;
            rebasedSrc = anImage._getRebasedSrc();

            expect(rebasedSrc).toBe(src);
        });

        it("should not rebase protocol: urls", function() {
            var src = "protocol://image.jpg",
                rebasedSrc;

            anImage.src = src;
            rebasedSrc = anImage._getRebasedSrc();

            expect(rebasedSrc).toBe(src);
        });

        it("should not rebase empty urls", function() {
            var src = "",
                rebasedSrc;

            anImage.src = src;
            rebasedSrc = anImage._getRebasedSrc();

            expect(rebasedSrc).toBe(null);
        });

        it("should not rebase null urls", function() {
            var src = null,
                rebasedSrc;

            anImage.src = src;
            rebasedSrc = anImage._getRebasedSrc();

            expect(rebasedSrc).toBe(null);
        });

        it("should not rebase relative urls when owner document is not available", function() {
            var src = "logo-montage.png",
                rebasedSrc;

            anImage._ownerDocumentPart = null;
            anImage.src = src;
            rebasedSrc = anImage._getRebasedSrc();

            expect(rebasedSrc).toBe(null);
        });

        it("should not rebase relative urls when base url is not available", function() {
            var src = "logo-montage.png",
                rebasedSrc;

            anImage._ownerDocumentPart = {
                template: {
                    getBaseUrl: function() {
                        return null;
                    }
                }
            };
            anImage.src = src;
            rebasedSrc = anImage._getRebasedSrc();

            expect(rebasedSrc).toBe(null);
        });

        it("should rebase relative urls when base url is not available", function() {
            var src = "logo-montage.png",
                rebasedSrc;

            anImage._ownerDocumentPart = {
                template: {
                    getBaseUrl: function() {
                        return "http://montagejs.org/images/";
                    }
                }
            };
            anImage.src = src;
            rebasedSrc = anImage._getRebasedSrc();

            expect(rebasedSrc).toBe("http://montagejs.org/images/logo-montage.png");
        });

        it("should rebase relative urls as soon as owner template is available", function() {
            var src = "logo-montage.png";

            anImage.src = src;
            anImage._ownerDocumentPart = {
                template: {
                    getBaseUrl: function() {
                        return "http://montagejs.org/images/";
                    }
                }
            };

            expect(anImage.src).toBe("http://montagejs.org/images/logo-montage.png");
        });
    });

    describe("blueprint", function () {
        it("can be created", function () {
            var blueprintPromise = AbstractImage.blueprint;
            return blueprintPromise.then(function (blueprint) {
                expect(blueprint).not.toBeNull();
            });
        });
    });
});
