// ================================================
// day6/calculator.js
// QuerySelector + EventListener 활용 계산기
// ================================================

// 1. DOM 요소 선택
const display = document.querySelector("#display");
const numberButtons = document.querySelectorAll(".number");
const operatorButtons = document.querySelectorAll(".operator");
const enterButton = document.querySelector(".enter");
const clearButton = document.querySelector(".clear");
const onOffButton = document.querySelector(".on-off");

// 2. 상태 변수
let isOn = false;        // 계산기 ON/OFF 상태
let currentInput = "0"; // 현재 화면에 표시되는 값
let hasResult = false;   // 방금 계산 결과를 출력했는지 여부

// 3. 화면 업데이트 함수
function updateDisplay(value) {
    display.value = value;
}

// 4. ON/OFF 버튼 이벤트
onOffButton.addEventListener("click", function () {
    isOn = !isOn;

    if (isOn) {
        // 켜짐
        onOffButton.classList.add("on");
        onOffButton.textContent = "ON/OFF";
        currentInput = "0";
        updateDisplay("0");
    } else {
        // 꺼짐
        onOffButton.classList.remove("on");
        currentInput = "";
        updateDisplay("");
    }
});

// 5. 숫자 & 소수점 버튼 이벤트
numberButtons.forEach(function (button) {
    button.addEventListener("click", function () {

        // 꺼져 있으면 동작 안 함
        if (!isOn) return;

        const value = button.textContent;

        // 방금 결과를 출력한 상태에서 숫자 누르면 새로 입력
        if (hasResult) {
            currentInput = "";
            hasResult = false;
        }

        // 소수점 중복 방지
        if (value === ".") {
            // 현재 마지막 숫자 블록에 소수점이 이미 있으면 무시
            const parts = currentInput.split(/[+\-*/]/);
            const lastPart = parts[parts.length - 1];
            if (lastPart.includes(".")) return;
        }

        // 0으로 시작하는 숫자 방지 (연산자 뒤 제외)
        if (currentInput === "0" && value !== ".") {
            currentInput = value;
        } else {
            currentInput += value;
        }

        updateDisplay(currentInput);
    });
});

// 6. 연산자 버튼 이벤트
operatorButtons.forEach(function (button) {
    button.addEventListener("click", function () {

        // 꺼져 있으면 동작 안 함
        if (!isOn) return;

        const value = button.textContent;

        // 연산자 연속 입력 방지
        const lastChar = currentInput.slice(-1);
        if (["+", "-", "*", "/"].includes(lastChar)) {
            // 마지막 연산자를 새 연산자로 교체
            currentInput = currentInput.slice(0, -1) + value;
            updateDisplay(currentInput);
            return;
        }

        hasResult = false;
        currentInput += value;
        updateDisplay(currentInput);
    });
});

// 7. Enter(계산) 버튼 이벤트
enterButton.addEventListener("click", function () {

    // 꺼져 있으면 동작 안 함
    if (!isOn) return;

    // 빈 값이면 무시
    if (currentInput === "" || currentInput === "0") return;

    // 마지막 문자가 연산자면 무시
    const lastChar = currentInput.slice(-1);
    if (["+", "-", "*", "/"].includes(lastChar)) return;

    try {
        // eval 대신 직접 파서 사용 (사칙연산 우선순위 적용)
        const result = calculateExpression(currentInput);

        if (isNaN(result) || !isFinite(result)) {
            updateDisplay("Error");
            currentInput = "0";
        } else {
            // 소수점 자리 정리
            const formatted = parseFloat(result.toFixed(10)).toString();
            updateDisplay(formatted);
            currentInput = formatted;
            hasResult = true;
        }
    } catch (e) {
        updateDisplay("Error");
        currentInput = "0";
    }
});

// 8. C(초기화) 버튼 이벤트
clearButton.addEventListener("click", function () {

    // 꺼져 있으면 동작 안 함
    if (!isOn) return;

    currentInput = "0";
    hasResult = false;
    updateDisplay("0");
});

// 9. 사칙연산 우선순위 파서 (* / 먼저, + - 나중)
function calculateExpression(expr) {
    const tokens = expr.match(/(\d+\.?\d*|[+\-*/])/g);
    if (!tokens) return NaN;

    let pos = 0;

    function parseNumber() {
        if (pos >= tokens.length) return NaN;
        const num = parseFloat(tokens[pos]);
        pos++;
        return num;
    }

    function parseTerm() {
        let left = parseNumber();
        while (pos < tokens.length && (tokens[pos] === "*" || tokens[pos] === "/")) {
            const op = tokens[pos];
            pos++;
            const right = parseNumber();
            if (op === "*") {
                left *= right;
            } else {
                if (right === 0) return Infinity;
                left /= right;
            }
        }
        return left;
    }

    function parseExpression() {
        let left = parseTerm();
        while (pos < tokens.length && (tokens[pos] === "+" || tokens[pos] === "-")) {
            const op = tokens[pos];
            pos++;
            const right = parseTerm();
            if (op === "+") {
                left += right;
            } else {
                left -= right;
            }
        }
        return left;
    }

    return parseExpression();
}
