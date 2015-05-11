
public class array01 {

    public static void arrMys(int[] arr) {
        for (int i = 1; i < arr.length - 1; i++) {
            arr[i] = i * arr[i - 1] + arr[i + 1];
        }
    }

}

