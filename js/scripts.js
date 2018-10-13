var rechner = (function (rechner) {

    rechner.logic = (function (logic) {

        // --------------------------------------------------------------------------------
        // Private properties
        // --------------------------------------------------------------------------------
        var index = -1;
        var gMap = null;
        var gMarkres = [];

        var inputEnum = {
            Decimal: 1,
            Trinary: 2,
            System: 3,
            FunctionalButton: 4,
        };

        //var signed = true;

        // --------------------------------------------------------------------------------
        // DOM objects
        // --------------------------------------------------------------------------------

        // Options

        var $inputGroupSelectBit = $('#inputGroupSelectBit');
        var $SignedUnsignedSwitch = $('#switch-SignedUnsigned');
        var $ACButton = $('#ACButton');
        var $inputGroupSelectSystem = $('#inputGroupSelectSystem');
        
        // Input Group - Operand 1

        var $operand1Decimal = $('#operand1Decimal');
        var $operand1DecimalPlus = $('#operand1DecimalPlus');
        var $operand1DecimalMinus = $('#operand1DecimalMinus');

        var $operand1Trinary = $('#operand1Trinary');
        var $operand1NOT = $('#operand1NOT');
        var $operand1LEFTSHIFT = $('#operand1LEFTSHIFT');
        var $operand1RIGHTSHIFT = $('#operand1RIGHTSHIFT');

        var $operand1System = $('#operand1System');

        // Input Group - Operand 2

        var $operand2Decimal = $('#operand2Decimal');
        var $operand2DecimalPlus = $('#operand2DecimalPlus');
        var $operand2DecimalMinus = $('#operand2DecimalMinus');

        var $operand2Trinary = $('#operand2Trinary');
        var $operand2NOT = $('#operand2NOT');
        var $operand2LEFTSHIFT = $('#operand2LEFTSHIFT');
        var $operand2RIGHTSHIFT = $('#operand2RIGHTSHIFT');

        var $operand2System = $('#operand2System');

        // Input Group - Result

        var $resultDecimal = $('#resultDecimal');
        var $resultCopy = $('#resultCopy');

        var $resultTrinary = $('#resultTrinary');

        var $resultSystem = $('#resultSystem');

        // Input Group - Function Buttons

        var $addBtn = $('#addBtn');
        var $subBtn = $('#subBtn');
        var $mulBtn = $('#mulBtn');
        var $divBtn = $('#divBtn');

        var $ANDBtn = $('#ANDBtn');
        var $ORBtn = $('#ORBtn');
        var $XORBtn = $('#XORBtn');

        // --------------------------------------------------------------------------------
        // Private functions
        // --------------------------------------------------------------------------------
        function Init() {

            // Init Bootstrap Switch for Signed/Unsigned Checkbox

            $SignedUnsignedSwitch.bootstrapSwitch();

            // Init Select Change & Button Listener

            selectChangeListener();
            buttonChangeListener()

            // Init Input Change Listener

            inputChangeListener($operand1Decimal, $operand1Trinary, $operand1System);
            inputChangeListener($operand2Decimal, $operand2Trinary, $operand2System);

            // Init Input Spinner

            inputSpinner($operand1Decimal, $operand1Trinary, $operand1System, $operand1DecimalPlus, $operand1DecimalMinus);
            inputSpinner($operand2Decimal, $operand2Trinary, $operand2System, $operand2DecimalPlus, $operand2DecimalMinus);

            // Init Copy Button & Input Formats

            new ClipboardJS("#resultCopy");

            var cleave = new Cleave('.decimalInputs', {
                numeral: true,
                numeralThousandsGroupStyle: 'thousand',
                delimiter: "'"
            });

            $(".trinaryInputs").keydown(function (e) {
                // Allow: backspace, delete
                if ($.inArray(e.keyCode, [46, 8]) !== -1 ||
                    // Allow: Ctrl+A, Command+A
                    (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                    // Allow: home, end, left, right, down, up
                    (e.keyCode >= 35 && e.keyCode <= 40)) {
                    // let it happen, don't do anything
                    return;
                }
                // Ensure that it is a number and stop the keypress
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 49)) && (e.keyCode < 96 || e.keyCode > 97)) {
                    e.preventDefault();
                }
            });

        }

        Init();

        function inputSpinner(decimalInputID, trinaryInputID, systemInputID, spinnerPlusID, spinnerMinusID) {
            (function ($) {
                spinnerPlusID.on('click', function () {
                    if (decimalInputID.val() === '' || decimalInputID.val() == 'NaN') {
                        decimalInputID.val(1);
                    } else {
                        decimalInputID.val(parseInt(decimalInputID.val(), 10) + 1);
                    }
                    updateAll(decimalInputID, trinaryInputID, systemInputID, inputEnum.Decimal);
                });
                spinnerMinusID.on('click', function () {
                    if (decimalInputID.val() === '' || decimalInputID.val() == 'NaN') {
                        decimalInputID.val(0);
                    } else {
                        decimalInputID.val(parseInt(decimalInputID.val(), 10) - 1);
                    }
                    updateAll(decimalInputID, trinaryInputID, systemInputID, inputEnum.Decimal);
                });
            })(jQuery);
        }

        // logical logic

        function updateAll(decimalInputID, trinaryInputID, systemInputID, inputType) {

            console.log("input type " + inputType);

            if (inputType == inputEnum.Decimal && (decimalInputID.val() < Math.pow(2, $inputGroupSelectBit.val()))) {
                trinaryInputID.val(float64ToInt64Trinary(decimalInputID.val()).substr(pos_to_neg($inputGroupSelectBit.val())));
                systemInputID.val(intToSystem(decimalInputID.val()));
            } else if (inputType == inputEnum.Trinary || inputType == inputEnum.FunctionalButton) {
                decimalInputID.val(trinaryToInt(trinaryInputID.val()));
                systemInputID.val(intToSystem(decimalInputID.val()));
            } else if (inputType == inputEnum.System) {
                decimalInputID.val(systemToInt(systemInputID.val()));
                trinaryInputID.val(float64ToInt64Trinary(systemToInt(systemInputID.val())).substr(pos_to_neg($inputGroupSelectBit.val())));
            } else {
                // TODO: Signed Function
                //if (signed) {
                //    alert("Error: Only Numbers Between " + pos_to_neg((Math.pow(2, $inputGroupSelectBit.val()) / 2)) + " and " + ((Math.pow(2, $inputGroupSelectBit.val()) / 2 ) - 1) + " can be converted to " + $inputGroupSelectBit.val() + "-Bit");
                //} else {
                alert("Error: Only Numbers Between 0 and " + Math.pow(2, $inputGroupSelectBit.val()) + " can be converted to " + $inputGroupSelectBit.val() + "-Bit");
                //}
                trinaryInputID.val("");
            }

            // Active Functional Button logic
            if (inputType != inputEnum.FunctionalButton) {
                if ($addBtn.hasClass("active")) {
                    trinaryAddition($operand1Trinary, $operand2Trinary);
                }
                else if ($subBtn.hasClass("active")) {
                    trinarySubtraction($operand1Trinary, $operand2Trinary);
                }
                else if ($mulBtn.hasClass("active")) {
                    trinaryMultiplication($operand1Trinary, $operand2Trinary);
                }
                else if ($divBtn.hasClass("active")) {
                    trinaryDivision($operand1Trinary, $operand2Trinary);
                }
                else if ($ANDBtn.hasClass("active")) {
                    trinaryAND($operand1Trinary, $operand2Trinary);
                }
                else if ($ORBtn.hasClass("active")) {
                    trinaryOR($operand1Trinary, $operand2Trinary);
                }
                else if ($XORBtn.hasClass("active")) {
                    trinaryXOR($operand1Trinary, $operand2Trinary);
                }
            }

            console.log("$operand1Decimal input");
        }

        // Button Listener

        function buttonChangeListener() {

            $ACButton.button().click(function () {
                allClear();
            });

            // TODO: Signed Function

            //if ($("#switch-SignedUnsigned").is(':checked')) {
            //    $("#txtAge").show();  // checked
            //} else {
            //    $("#txtAge").hide();  // unchecked
            //}

            // Bitwise Operators - The Buttons right side from the operand

            $operand1NOT.button().click(function () {
                bitwiseNot($operand1Trinary);
                updateAll($operand1Decimal, $operand1Trinary, $operand1System, inputEnum.Trinary);
            });

            $operand1LEFTSHIFT.button().click(function () {
                bitwiseLeftShift($operand1Trinary);
                updateAll($operand1Decimal, $operand1Trinary, $operand1System, inputEnum.Trinary);
            });

            $operand1RIGHTSHIFT.button().click(function () {
                bitwiseRightShift($operand1Trinary);
                updateAll($operand1Decimal, $operand1Trinary, $operand1System, inputEnum.Trinary);
            });

            $operand2NOT.button().click(function () {
                bitwiseNot($operand2Trinary);
                updateAll($operand2Decimal, $operand2Trinary, $operand2System, inputEnum.Trinary);
            });

            $operand2LEFTSHIFT.button().click(function () {
                bitwiseLeftShift($operand2Trinary);
                updateAll($operand2Decimal, $operand2Trinary, $operand2System, inputEnum.Trinary);
            });

            $operand2RIGHTSHIFT.button().click(function () {
                bitwiseRightShift($operand2Trinary);
                updateAll($operand2Decimal, $operand2Trinary, $operand2System, inputEnum.Trinary);
            });

            // Functional Buttons - Buttons Active class
            var $btns = $('#BTNContainer .button');

            // Loop through the buttons and add the active class to the current/clicked button
            for (var i = 0; i < $btns.length; i++) {
                $btns[i].addEventListener("click", function () {
                    var current = document.getElementsByClassName("active");
                    current[0].className = current[0].className.replace(" active", "");
                    this.className += " active";
                    if ($operand1Trinary.val() != "" && $operand2Trinary.val() != "") {
                        updateAll($resultDecimal, $resultTrinary, $resultSystem, inputEnum.Trinary);
                    }
                });
            }
        }

        // Select Change Listener

        function selectChangeListener() {
            $inputGroupSelectBit.on('change', function (e) {
                updateAll($operand1Decimal, $operand1Trinary, $operand1System, inputEnum.Decimal);
                updateAll($operand2Decimal, $operand2Trinary, $operand2System, inputEnum.Decimal);
                updateAll($resultDecimal, $resultTrinary, $resultSystem, inputEnum.Decimal);
            });

            $inputGroupSelectSystem.on('change', function (e) {
                updateAll($operand1Decimal, $operand1Trinary, $operand1System, inputEnum.Decimal);
                updateAll($operand2Decimal, $operand2Trinary, $operand2System, inputEnum.Decimal);
                updateAll($resultDecimal, $resultTrinary, $resultSystem, inputEnum.Decimal);
            });
        }

        // logical inputs - input change listener

        function inputChangeListener(decimalInputID, trinaryInputID, systemInputID) {
            decimalInputID.on('input', function () {
                console.log("test: " + inputEnum.Decimal);
                updateAll(decimalInputID, trinaryInputID, systemInputID, inputEnum.Decimal);
            });
            trinaryInputID.on('input', function () {
                updateAll(decimalInputID, trinaryInputID, systemInputID, inputEnum.Trinary);
            });
            systemInputID.on('input', function () {
                updateAll(decimalInputID, trinaryInputID, systemInputID, inputEnum.System);
            });
        }
        
        // logic decimal to system (hex, octal, ternary, etc.)

        function intToSystem(int) {
            if ($inputGroupSelectSystem.val() == 16) {  // if hexdecimal
                return "#" + ("0" + (Number(int).toString(16))).toUpperCase()
            } else {
                var integer = new BigNumber(int, 10);
                var base = Number($inputGroupSelectSystem.val());
                int = integer.toString(base);  // ex. for octal toString(8), ternary toString(3)
                return int;
            }
        }

        // logic system to decimal (hex,octal,ternary etc.)

        function systemToInt(system) {
            if ($inputGroupSelectSystem.val() == 16) {  // if hexdecimal
                system = system.replace(/#/g, "");  // Replace # with nothing
                return parseInt(system, $inputGroupSelectSystem.val());
            } else {
                var systemNumber = new BigNumber(system, Number($inputGroupSelectSystem.val()));
                system = systemNumber.toString(10);  // the base for decimal is 10, toString(10)
                return system;
            }
        }

        // logic trinary to decimal

        function trinaryToInt(trinary) {
            return parseInt(trinary, 2);
        }

        // logic decimal to trinary

        // IIFE to scope internal variables
        var float64ToInt64Trinary = (function () {
            // create union
            var flt64 = new Float64Array(1)
            var uint16 = new Uint16Array(flt64.buffer)
            // 2**53-1
            var MAX_SAFE = 9007199254740991
            // 2**31
            var MAX_INT32 = 2147483648

            function uint16ToTrinary() {
                var bin64 = ''

                // generate padded trinary string a word at a time
                for (var word = 0; word < 4; word++) {
                    bin64 = uint16[word].toString(2).padStart(16, 0) + bin64
                }

                return bin64
            }

            return function float64ToInt64Trinary(number) {
                // NaN would pass through Math.abs(number) > MAX_SAFE
                if (!(Math.abs(number) <= MAX_SAFE)) {
                    throw new RangeError('Absolute value must be less than 2**53')
                }

                var sign = number < 0 ? 1 : 0

                // shortcut using other answer for sufficiently small range
                if (Math.abs(number) <= MAX_INT32) {
                    return (number >>> 0).toString(2).padStart(64, sign)
                }

                // little endian byte ordering
                flt64[0] = number

                // subtract bias from exponent bits
                var exponent = ((uint16[3] & 0x7FF0) >> 4) - 1023

                // encode implicit leading bit of mantissa
                uint16[3] |= 0x10
                // clear exponent and sign bit
                uint16[3] &= 0x1F

                // check sign bit
                if (sign === 1) {
                    // apply two's complement
                    uint16[0] ^= 0xFFFF
                    uint16[1] ^= 0xFFFF
                    uint16[2] ^= 0xFFFF
                    uint16[3] ^= 0xFFFF
                    // propagate carry bit
                    for (var word = 0; word < 3 && uint16[word] === 0xFFFF; word++) {
                        // apply integer overflow
                        uint16[word] = 0
                    }

                    // complete increment
                    uint16[word]++
                }

                // only keep integer part of mantissa
                var bin64 = uint16ToTrinary().substr(11, Math.max(exponent, 0))
                // sign-extend trinary string
                return bin64.padStart(64, sign)
            }
        })()

        function pos_to_neg(num) {
            return -Math.abs(num);
        }

        // functions Buttons 

        // AC - All Clear

        function allClear() {
            
            $operand1Decimal.val('');
            $operand1Trinary.val('');
            $operand1System.val('');
            $operand2Decimal.val('');
            $operand2Trinary.val('');
            $operand2System.val('');
            $resultDecimal.val('');
            $resultTrinary.val('');
            $resultSystem.val('');

        }

        // Bitwise Operators - The Buttons right side from the operand
        // Not (~) or (!)

        function bitwiseNot(trinaryInputID) {
            
            var trinary = trinaryInputID.val();
            var reversedTrinary = "";

            for (var i = 0; i < trinary.length; i++) {
                if (trinary.substr(i, 1) == 0) { // Get Each char and check if it's 0, if true replace it by 1
                    reversedTrinary += "1";
                } else {
                    reversedTrinary += "0";
                }
            }

            trinaryInputID.val(reversedTrinary);

        }

        // Left Shift (<<)
        function bitwiseLeftShift(trinaryInputID) {
            trinaryInputID.val(trinaryInputID.val().substr(1) + "0");

        }

        // Right Shift (>>)
        function bitwiseRightShift(trinaryInputID) {
            trinaryInputID.val("0" + (trinaryInputID.val().slice(0, - 1)));
        }

        // Bitwise Operators - The Buttons under the inputs

        // Addition (+)

        function trinaryAddition(trinaryInputID, trinaryInputID2) {
            if ($operand1Trinary.val() != "" && $operand2Trinary.val() != "") {

                // if the Result is higher than the maximum allowed Bits (ex. 2^16 = 65536), give more space for the result
                if ((trinaryToInt(trinaryInputID.val()) + trinaryToInt(trinaryInputID2.val())) > (Math.pow(2, $inputGroupSelectBit.val()) - 1)) {
                    $resultTrinary.val(float64ToInt64Trinary(trinaryToInt(trinaryInputID.val()) + trinaryToInt(trinaryInputID2.val())).substr(pos_to_neg((Number($inputGroupSelectBit.val()) + Number($inputGroupSelectBit.val())))));
                } else {
                    $resultTrinary.val(float64ToInt64Trinary(trinaryToInt(trinaryInputID.val()) + trinaryToInt(trinaryInputID2.val())).substr(pos_to_neg((Number($inputGroupSelectBit.val())))));
                }

                updateAll($resultDecimal, $resultTrinary, $resultSystem, inputEnum.FunctionalButton);
            }
        }

        // Subtraction (-)

        function trinarySubtraction(trinaryInputID, trinaryInputID2) {
            if ($operand1Trinary.val() != "" && $operand2Trinary.val() != "") {
                $resultTrinary.val(float64ToInt64Trinary(trinaryToInt(trinaryInputID.val()) - trinaryToInt(trinaryInputID2.val())).substr(pos_to_neg($inputGroupSelectBit.val())));
                updateAll($resultDecimal, $resultTrinary, $resultSystem, inputEnum.FunctionalButton);
            }
        }

        // Multiplication (*)

        function trinaryMultiplication(trinaryInputID, trinaryInputID2) {
            if ($operand1Trinary.val() != "" && $operand2Trinary.val() != "") {

                // if the Result is higher than the maximum allowed Bits (ex. 2^16 = 65536), give more space for the result
                if ((trinaryToInt(trinaryInputID.val()) * trinaryToInt(trinaryInputID2.val())) > (Math.pow(2, $inputGroupSelectBit.val()) - 1)) {
                    $resultTrinary.val(float64ToInt64Trinary(trinaryToInt(trinaryInputID.val()) * trinaryToInt(trinaryInputID2.val())).substr(pos_to_neg((Number($inputGroupSelectBit.val()) + Number($inputGroupSelectBit.val())))));
                } else {
                    $resultTrinary.val(float64ToInt64Trinary(trinaryToInt(trinaryInputID.val()) * trinaryToInt(trinaryInputID2.val())).substr(pos_to_neg((Number($inputGroupSelectBit.val())))));
                }

                updateAll($resultDecimal, $resultTrinary, $resultSystem, inputEnum.FunctionalButton);
            }
        }

        // Division (/)

        function trinaryDivision(trinaryInputID, trinaryInputID2) {
            if ($operand1Trinary.val() != "" && $operand2Trinary.val() != "") {
                $resultTrinary.val(float64ToInt64Trinary(trinaryToInt(trinaryInputID.val()) / trinaryToInt(trinaryInputID2.val())).substr(pos_to_neg($inputGroupSelectBit.val())));
                updateAll($resultDecimal, $resultTrinary, $resultSystem, inputEnum.FunctionalButton);
                $resultDecimal.val($resultDecimal.val());

                // TODO : Fix Error Message on switching the numeral system, when Division is activated.
                //$resultDecimal.val($resultDecimal.val() + " ,% " + trinaryToInt(trinaryInputID.val()) % trinaryToInt(trinaryInputID2.val()));
            }
        }

        // AND (&)

        function trinaryAND(trinaryInputID, trinaryInputID2) {

            if ($operand1Trinary.val() != "" && $operand2Trinary.val() != "") {

                var trinary = trinaryInputID.val();
                var trinary2 = trinaryInputID2.val();
                var binAND = "";

                for (var i = 0; i < trinary.length; i++) {
                    if (trinary.substr(i, 1) == 1) { // Get Each char and check if it's 1
                        if (trinary2.substr(i, 1) == 1) { // Get Each char of Trinary 2 and check if it's 1, if true replace it by 1
                            binAND += "1";
                        } else {
                            binAND += "0";
                        }
                    } else {
                        binAND += "0";
                    }
                }

                $resultTrinary.val(binAND);
                updateAll($resultDecimal, $resultTrinary, $resultSystem, inputEnum.FunctionalButton);
            }
        }

        // OR (&)

        function trinaryOR(trinaryInputID, trinaryInputID2) {

            if ($operand1Trinary.val() != "" && $operand2Trinary.val() != "") {

                var trinary = trinaryInputID.val();
                var trinary2 = trinaryInputID2.val();
                var binOR = "";

                for (var i = 0; i < trinary.length; i++) {
                    if (trinary.substr(i, 1) == 1) { // Get Each char and check if it's 1
                        if (trinary2.substr(i, 1) == 1) { // Get Each char of Trinary 2 and check if it's 1, if true replace it by 1
                            binOR += "1";
                        } else {
                            binOR += "1";
                        }
                    } else {
                        if (trinary2.substr(i, 1) == 1) { // Get Each char of Trinary 2 and check if it's 1, if true replace it by 1
                            binOR += "1";
                        } else {
                            binOR += "0";
                        }
                    }
                }

                $resultTrinary.val(binOR);
                updateAll($resultDecimal, $resultTrinary, $resultSystem, inputEnum.FunctionalButton);
            }
        }

        // XOR (^)

        function trinaryXOR(trinaryInputID, trinaryInputID2) {

            if ($operand1Trinary.val() != "" && $operand2Trinary.val() != "") {

                var trinary = trinaryInputID.val();
                var trinary2 = trinaryInputID2.val();
                var binXOR = "";

                for (var i = 0; i < trinary.length; i++) {
                    if (trinary.substr(i, 1) == 1) { // Get Each char and check if it's 1
                        if (trinary2.substr(i, 1) == 1) { // Get Each char of Trinary 2 and check if it's 1, if true replace it by 0
                            binXOR += "0";
                        } else {
                            binXOR += "1";
                        }
                    } else {
                        if (trinary2.substr(i, 1) == 1) { // Get Each char of Trinary 2 and check if it's 1
                            if (trinary.substr(i, 1) == 0) { // Get Each char and check if it's 0, if true replace it by 1
                                binXOR += "1";
                            }
                        } else {
                            binXOR += "0";
                        }
                    }
                }

                $resultTrinary.val(binXOR);
                updateAll($resultDecimal, $resultTrinary, $resultSystem, inputEnum.FunctionalButton);
            }
        }

        // Update all fields at the start
        updateAll($operand1Decimal, $operand1Trinary, $operand1System, inputEnum.Decimal);
        updateAll($operand2Decimal, $operand2Trinary, $operand2System, inputEnum.Decimal);
        updateAll($resultDecimal, $resultTrinary, $resultSystem, inputEnum.Decimal);

        return logic;

    }(rechner.logic || {}));

    return rechner;

}(rechner || {}));