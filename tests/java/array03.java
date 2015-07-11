public class array03 {

    public static void mystery(int[] list) {
        for (int i = 1; i < list.length; i++) {
            if (list[i - 1] % 2 == 0) {
                list[i - 1]++;
                list[i]++;
            }
        }
    }

}

