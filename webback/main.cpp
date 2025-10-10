#include <iostream>

int main() {
    long long int n, sum;
    std::cin >> n;
    sum = 0;
    while (n > 0) {
        sum = sum + n % 10;
        n = n / 10;
    }
    std::cout << sum;
}
